const Airtable = require('airtable');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load from Next.js local env if possible
dotenv.config({ path: path.join(__dirname, '../jab-cloud-gateway/.env.local') });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function twilioLookup(phoneNumber) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !auth) return { lineType: "unknown", carrier: "unknown" };

    try {
        const authHeader = `Basic ${Buffer.from(`${sid}:${auth}`).toString('base64')}`;
        const url = `https://lookups.twilio.com/v2/PhoneNumbers/${phoneNumber}?Fields=line_type_intelligence`;
        const response = await axios.get(url, { headers: { "Authorization": authHeader } });
        return {
            lineType: response.data.line_type_intelligence?.type || "unknown",
            carrier: response.data.line_type_intelligence?.carrier_name || "unknown",
            e164: response.data.phone_number
        };
    } catch (err) {
        return { lineType: "error", carrier: "error" };
    }
}

async function hunterEnrich(website) {
    const hunterKey = process.env.HUNTER_API_KEY;
    if (!hunterKey || !website) return { email: null, success: false };

    try {
        const domain = website.replace("https://", "").replace("http://", "").split("/")[0].replace("www.", "");
        const res = await axios.get(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}&limit=1`);
        if (res.data.data && res.data.data.emails && res.data.data.emails.length > 0) {
            return { email: res.data.data.emails[0].value, success: true };
        }
    } catch (e) {
        // silently fail for bad domains
    }
    return { email: null, success: false };
}

async function backfillIntelligence() {
    console.log("Starting Intelligence Backfill...");
    
    // Fetch leads where Line Type is empty OR Hunter Enriched is empty/false
    let records;
    try {
        records = await base('tblXC5DVlvsecX8GC').select({
            filterByFormula: "OR({Line Type} = '', {Hunter Enriched} != TRUE())",
            maxRecords: 50 // Limit to 50 per run to respect API rate limits
        }).all();
    } catch (err) {
        console.error("Airtable fetch failed:", err);
        return;
    }

    console.log(`Found ${records.length} records needing enrichment.`);

    for (let r of records) {
        const id = r.id;
        const name = r.get("Full Name");
        const phone = r.get("phone_e164") || r.get("Phone");
        let emailOrWebsite = r.get("Email");
        const currentLineType = r.get("Line Type");
        const currentHunter = r.get("Hunter Enriched");
        
        const updates = {};
        
        // Handle tags whether they are a string (Single line text) or Array (Multi-select)
        let rawTags = r.get("Tags");
        let tags = [];
        if (Array.isArray(rawTags)) {
            tags = [...rawTags];
        } else if (typeof rawTags === 'string') {
            tags = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }

        // 1. Twilio Update
        if (!currentLineType && phone) {
            console.log(`[Twilio] Looking up ${phone} for ${name}...`);
            const twilioData = await twilioLookup(phone);
            updates["Line Type"] = twilioData.lineType;
            updates["Carrier"] = twilioData.carrier;
            if (twilioData.e164) updates["phone_e164"] = twilioData.e164;
            if (twilioData.lineType === "mobile" && !tags.includes("SMS Eligible")) tags.push("SMS Eligible");
        }

        // 2. Hunter Update
        if (!currentHunter && emailOrWebsite && (emailOrWebsite.startsWith("http") || !emailOrWebsite.includes("@"))) {
            console.log(`[Hunter] Enriching ${emailOrWebsite} for ${name}...`);
            const hunterData = await hunterEnrich(emailOrWebsite);
            if (hunterData.success) {
                updates["Email"] = hunterData.email;
                updates["Hunter Enriched"] = true;
                if (!tags.includes("Hunter Enriched")) tags.push("Hunter Enriched");
            } else {
                // Mark as checked but failed so we don't keep trying
                updates["Hunter Enriched"] = false; 
            }
        }

        if (Object.keys(updates).length > 0) {
            // If tags are an array, join them into a string for the Single line text field
            if (tags.length > 0) updates["Tags"] = tags.join(", ");
            
            try {
                await base('tblXC5DVlvsecX8GC').update(id, updates);
                console.log(`✅ Updated ${name}`);
            } catch (err) {
                console.error(`❌ Failed to update ${name}:`, err.message);
            }
        }
        
        // Brief pause to respect rate limits
        await new Promise(res => setTimeout(res, 500));
    }
    
    console.log("Backfill complete for this batch.");
}

backfillIntelligence();

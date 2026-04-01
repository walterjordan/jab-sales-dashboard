const Airtable = require('airtable');
const dotenv = require('dotenv');
const path = require('path');

// Load from Next.js local env if possible
dotenv.config({ path: path.join(__dirname, '../jab-cloud-gateway/.env.local') });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function checkNewestLeads() {
    console.log("Checking for leads created in the last 10 minutes...");
    try {
        const records = await base('tblXC5DVlvsecX8GC').select({
            maxRecords: 10,
            sort: [{ field: "Lead Score", direction: "desc" }] // Temporary sort since no 'Created Time' field is visible
        }).all();

        if (records.length === 0) {
            console.log("No leads found.");
            return;
        }

        records.forEach(r => {
            console.log(`---`);
            console.log(`ID: ${r.id}`);
            console.log(`Name: ${r.get("Full Name")}`);
            console.log(`Email/URL: ${r.get("Email")}`);
            console.log(`Phone: ${r.get("Phone")}`);
            console.log(`Line Type: ${r.get("Line Type") || 'NOT SET'}`);
            console.log(`Hunter Enriched: ${r.get("Hunter Enriched") ? 'YES' : 'NO'}`);
        });
    } catch (err) {
        console.error("Error:", err.message);
    }
}

checkNewestLeads();

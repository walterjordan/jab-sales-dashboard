import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY || "";
const baseId = "appeJqZ5yjyPmh1MC";
const base = new Airtable({ apiKey }).base(baseId);
const textlinkApiKey = process.env.Textlinksms_api_key || "";

const TABLES = {
  LEADS: "tblXC5DVlvsecX8GC",
  CONVERSATIONS: "tblHHtMcNrH9RocXN",
  TASKS: "tblXlsLiHhXudrd7h",
  CHECKOUTS: "tblOwBkOONytvWDwi",
  REGISTRATIONS: "tblF6gLxCuiNF7uni",
};

async function clearTable(tableName: string) {
  let records: any[] = [];
  do {
    const page = await base(tableName).select({ maxRecords: 100 }).firstPage();
    records = Array.from(page);
    if (records.length > 0) {
      const ids = records.map((r) => r.id);
      for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);
        await base(tableName).destroy(batch);
        await new Promise(res => setTimeout(res, 300));
      }
    }
  } while (records.length > 0);
}

async function sendSms(phone: string, text: string) {
    try {
        const res = await fetch("https://textlinksms.com/api/send-sms", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${textlinkApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone_number: phone,
                text: text,
                sim_card_id: 1253
            })
        });
        const data = await res.json();
        if (data.ok) {
            console.log(`Sent SMS to ${phone}`);
        } else {
            console.error(`Failed to send SMS to ${phone}:`, data.message);
        }
    } catch (e: any) {
        console.error(`Failed to send SMS to ${phone}:`, e.message);
    }
}

async function setupRealLeads() {
    console.log("Clearing old demo data...");
    await clearTable(TABLES.CONVERSATIONS);
    await clearTable(TABLES.TASKS);
    await clearTable(TABLES.CHECKOUTS);
    await clearTable(TABLES.LEADS);

    // ==========================================
    // 1. MENYUAN JORDAN (Myn)
    // ==========================================
    console.log("Setting up Menyuan (Myn)...");
    const myn = await base(TABLES.LEADS).create({
        "Full Name": "Menyuan Jordan",
        "Email": "menyuanot@gmail.com",
        "Phone": "+16783615369",
        "phone_e164": "+16783615369",
        "primary_channel": "sms",
        "Sales Stage": "Qualify",
        "Lead Score": 75
    });

    // Add invisible context note for the AI to "remember" the phone call
    await base(TABLES.CONVERSATIONS).create({
        "Lead": [myn.id],
        "Channel": "SMS",
        "Direction": "Inbound",
        "Content": "SYSTEM CONTEXT: Walter spoke with Menyuan (who goes by Myn) on the phone earlier today about the EdgeMax AI Core package. She showed interest.",
        "Timestamp": new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
    });

    const mynMsg = "Hi Myn, it's Walter. Just following up on our call earlier today about the EdgeMax AI Core. Are you still interested in getting that set up?";
    
    // SEND LIVE SMS
    await sendSms("+16783615369", mynMsg);
    
    // Log outbound message to Dashboard
    await base(TABLES.CONVERSATIONS).create({
        "Lead": [myn.id],
        "Channel": "SMS",
        "Direction": "Outbound",
        "Content": mynMsg,
        "Timestamp": new Date().toISOString()
    });


    // ==========================================
    // 2. PRENTISS WORTHY
    // ==========================================
    console.log("Setting up Prentiss...");
    const prentiss = await base(TABLES.LEADS).create({
        "Full Name": "Prentiss Worthy",
        "Email": "pworthyjr@gmail.com",
        "Phone": "+14042736328",
        "phone_e164": "+14042736328",
        "primary_channel": "sms",
        "Sales Stage": "Qualify",
        "Lead Score": 75
    });

    // Add invisible context note for the AI
    await base(TABLES.CONVERSATIONS).create({
        "Lead": [prentiss.id],
        "Channel": "SMS",
        "Direction": "Inbound",
        "Content": "SYSTEM CONTEXT: Walter spoke with Prentiss on the phone earlier today about the EdgeMax AI Core package. He showed interest.",
        "Timestamp": new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
    });

    const prentissMsg = "Hi Prentiss, it's Walter. Following up on our chat earlier today about the EdgeMax AI Core. Are you still interested in moving forward with it?";
    
    // SEND LIVE SMS
    await sendSms("+14042736328", prentissMsg);
    
    // Log outbound message to Dashboard
    await base(TABLES.CONVERSATIONS).create({
        "Lead": [prentiss.id],
        "Channel": "SMS",
        "Direction": "Outbound",
        "Content": prentissMsg,
        "Timestamp": new Date().toISOString()
    });

    console.log("Real leads injected and live SMS follow-ups deployed!");
}

setupRealLeads().catch(console.error);

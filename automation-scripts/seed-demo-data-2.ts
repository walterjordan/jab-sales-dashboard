import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY || "";
const baseId = "appeJqZ5yjyPmh1MC";
const base = new Airtable({ apiKey }).base(baseId);

const TABLES = {
  LEADS: "tblXC5DVlvsecX8GC",
  CONVERSATIONS: "tblHHtMcNrH9RocXN",
  TASKS: "tblXlsLiHhXudrd7h",
  CHECKOUTS: "tblOwBkOONytvWDwi",
  REGISTRATIONS: "tblF6gLxCuiNF7uni",
};

async function seedSecondDemoLead() {
  console.log("Seeding second demo lead (Handoff scenario)...");

  // 1. Create a Lead
  const leadRecord = await base(TABLES.LEADS).create({
    "Full Name": "Marcus Vance",
    "Email": "mvance@vance-logistics.com",
    "Phone": "+14045551234",
    "phone_e164": "+14045551234",
    "primary_channel": "messenger",
    "Sales Stage": "Qualify",
    "Lead Score": 80,
    "handoff_requested": true
  });
  console.log(`Created Lead: ${leadRecord.id}`);

  // 2. Create Conversations (A complex objection leading to handoff)
  const timestamps = [
    new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    new Date(Date.now() - 1000 * 60 * 58 * 24).toISOString(),
    new Date(Date.now() - 1000 * 60 * 55 * 24).toISOString(),
    new Date(Date.now() - 1000 * 60 * 50 * 24).toISOString(),
  ];

  await base(TABLES.CONVERSATIONS).create([
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "Messenger",
        "Direction": "Inbound",
        "Content": "Hi, we currently use a highly customized SAP deployment for our logistics routing. Does the EdgeMax Core package integrate directly with proprietary SAP modules via SOAP?",
        "Timestamp": timestamps[0],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "Messenger",
        "Direction": "Outbound",
        "Content": "Hi Marcus. EdgeMax AI Core offers robust API integrations, but highly customized, proprietary SAP integrations via SOAP often require our enterprise-level architecture mapping to ensure security and data fidelity.",
        "Timestamp": timestamps[1],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "Messenger",
        "Direction": "Inbound",
        "Content": "Got it. Who can I speak to about getting an architecture map done? I need a human engineer to verify this before we pull the trigger.",
        "Timestamp": timestamps[2],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "Messenger",
        "Direction": "Outbound",
        "Content": "Understood. I have flagged your file for our senior engineering team. Walter will reach out to you personally to review your SAP requirements. Is your phone number the best way to reach you?",
        "Timestamp": timestamps[3],
      }
    }
  ]);
  console.log("Seeded Conversation History.");

  // 3. Create a Follow-up Task for the Handoff
  await base(TABLES.TASKS).create({
    "Task Name": "HANDOFF: SAP Integration Inquiry",
    "Lead": [leadRecord.id],
    "Due At": new Date().toISOString(), // Today
    "Reason": "High-value lead requires custom SAP integration architecture mapping. Human intervention required.",
    "Status": "Open"
  });
  console.log("Seeded Handoff Task.");

  console.log("Second demo environment seeded successfully!");
}

seedSecondDemoLead().catch(console.error);

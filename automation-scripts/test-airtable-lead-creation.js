const Airtable = require('airtable');

const apiKey = process.env.AIRTABLE_API_KEY || "YOUR_AIRTABLE_API_KEY";
const baseId = "appeJqZ5yjyPmh1MC";
const airtable = new Airtable({ apiKey }).base(baseId);

const TABLES = {
  LEADS: "tblXC5DVlvsecX8GC",
};

async function createLead() {
  try {
    const args = {
      fullName: "Test Lead System",
      email: "test_lead_system@example.com",
      phone: "+15559876543",
      preferredChannel: "SMS"
    };

    console.log("Attempting to create lead...");
    const record = await airtable(TABLES.LEADS).create({
      "Full Name": args.fullName,
      "Email": args.email,
      "Phone": args.phone,
      "Preferred Channel": args.preferredChannel,
      "Sales Stage": "Capture",
      "Lead Score": 10
    });
    console.log(`Success! Lead created with ID: ${record.id}`);
  } catch (error) {
    console.error("Error creating lead:");
    console.error(error);
  }
}

createLead();
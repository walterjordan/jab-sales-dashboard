const Airtable = require('airtable');

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

const base = new Airtable({ apiKey }).base(baseId);

async function checkParticipants() {
  const table = "tblb1l01AGfIZwWnC";
  try {
    console.log(`Checking table PARTICIPANTS (${table})...`);
    const records = await base(table).select({ maxRecords: 5 }).firstPage();
    console.log(`  Found ${records.length} records.`);
    records.forEach(r => console.log(`  - ${r.get("Name")} (${r.get("Email")})`));
  } catch (error) {
    console.error(`  Error checking PARTICIPANTS:`, error.message);
  }
}

checkParticipants();

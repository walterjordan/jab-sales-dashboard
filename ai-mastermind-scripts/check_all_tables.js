const Airtable = require('airtable');

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error("Airtable environment variables are missing.");
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function checkAllTables() {
  const tables = {
    LEADS: "tblXC5DVlvsecX8GC",
    CONVERSATIONS: "tblHHtMcNrH9RocXN",
    FOLLOW_UP_TASKS: "tblXlsLiHhXudrd7h",
    CHECKOUTS: "tblOwBkOONytvWDwi",
  };

  for (const [name, id] of Object.entries(tables)) {
    try {
      console.log(`Checking table ${name} (${id})...`);
      const records = await base(id).select({ maxRecords: 1 }).firstPage();
      console.log(`  Found ${records.length} records.`);
    } catch (error) {
      console.error(`  Error checking ${name}:`, error.message);
    }
  }
}

checkAllTables();

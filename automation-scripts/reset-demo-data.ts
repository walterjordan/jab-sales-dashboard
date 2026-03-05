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

async function clearTable(tableName: string) {
  let records: any[] = [];
  do {
    const page = await base(tableName).select({ maxRecords: 100 }).firstPage();
    records = Array.from(page);
    if (records.length > 0) {
      const ids = records.map((r) => r.id);
      
      // Delete in batches of 10
      for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);
        await base(tableName).destroy(batch);
        console.log(`Deleted ${batch.length} records from ${tableName}`);
        await new Promise(res => setTimeout(res, 300)); // rate limit protection
      }
    }
  } while (records.length > 0);
}

async function runCleanup() {
  console.log("Cleaning up database...");
  await clearTable(TABLES.CONVERSATIONS);
  await clearTable(TABLES.TASKS);
  await clearTable(TABLES.CHECKOUTS);
  await clearTable(TABLES.REGISTRATIONS);
  await clearTable(TABLES.LEADS);
  console.log("Cleanup complete!");
}

runCleanup().catch(console.error);

import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY || "YOUR_AIRTABLE_API_KEY";
const baseId = "appeJqZ5yjyPmh1MC";

const base = new Airtable({ apiKey }).base(baseId);

const TABLES = {
  LEADS: "tblXC5DVlvsecX8GC",
  CONVERSATIONS: "tblHHtMcNrH9RocXN",
};

async function checkRecentActivity() {
  console.log("--- RECENT LEADS ---");
  const leads = await base(TABLES.LEADS)
    .select({
      maxRecords: 5,
    })
    .firstPage();

  leads.forEach((l) => {
    console.log(`[Lead] ${l.get("Full Name")} | Phone: ${l.get("Phone")} | Created: ${l.get("Created Time")}`);
  });

  console.log("\n--- RECENT CONVERSATIONS ---");
  const convos = await base(TABLES.CONVERSATIONS)
    .select({
      maxRecords: 5,
      sort: [{ field: "Timestamp", direction: "desc" }],
    })
    .firstPage();

  convos.forEach((c) => {
    console.log(`[Convo] Direction: ${c.get("Direction")} | Channel: ${c.get("Channel")} | Content: ${c.get("Content")} | Time: ${c.get("Timestamp")}`);
  });
}

checkRecentActivity().catch(console.error);

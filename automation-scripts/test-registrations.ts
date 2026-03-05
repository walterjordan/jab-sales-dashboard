import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY || "";
const baseId = "appeJqZ5yjyPmh1MC";
const base = new Airtable({ apiKey }).base(baseId);

async function check() {
  try {
    const records = await base("tblF6gLxCuiNF7uni").select({
      maxRecords: 5,
      sort: [{ field: "created_at", direction: "desc" }] // or just don't sort if we don't know the created field name
    }).firstPage();

    console.log(`Found ${records.length} recent registrations.`);
    records.forEach(r => {
      console.log(`- ID: ${r.id}`);
      console.log(`  Name: ${r.get("Registrant Name")}`);
      console.log(`  Email: ${r.get("Registrant Email")}`);
      console.log(`  Session: ${r.get("Session")}`);
    });
  } catch (err) {
    try {
        const fallbackRecords = await base("tblF6gLxCuiNF7uni").select({
            maxRecords: 5
        }).firstPage();
        console.log(`Found ${fallbackRecords.length} recent registrations (unsorted).`);
        fallbackRecords.forEach(r => {
          console.log(`- ID: ${r.id}`);
          console.log(`  Name: ${r.get("Registrant Name")}`);
          console.log(`  Email: ${r.get("Registrant Email")}`);
          console.log(`  Session: ${r.get("Session")}`);
        });
    } catch (e) {
        console.error(e);
    }
  }
}

check();
import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY || "";
const baseId = "appeJqZ5yjyPmh1MC";
const base = new Airtable({ apiKey }).base(baseId);

async function check() {
  try {
    const records = await base("Live Sessions").select({
      filterByFormula: "AND({Session Status} = 'Upcoming', {Program Track} = 'Free 90-min')",
      maxRecords: 10
    }).firstPage();

    console.log(`Found ${records.length} upcoming free workshops.`);
    records.forEach(r => {
      console.log(`- ID: ${r.id}`);
      console.log(`  Title: ${r.get("Session Title")}`);
      console.log(`  Date: ${r.get("Session Date")}`);
      console.log(`  Status: ${r.get("Session Status")}`);
      console.log(`  Track: ${r.get("Program Track")}`);
    });
  } catch (err) {
    console.error(err);
  }
}

check();
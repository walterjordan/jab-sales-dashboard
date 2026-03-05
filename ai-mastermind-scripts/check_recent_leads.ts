import Airtable from "airtable";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from jab-cloud-gateway
dotenv.config({ path: path.join(__dirname, "../jab-cloud-gateway/.env.local") });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error("Airtable environment variables are missing.");
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);
const LEADS_TABLE = "tblXC5DVlvsecX8GC";

async function checkRecentLeads() {
  try {
    console.log("Checking for recent leads in Airtable...");
    const records = await base(LEADS_TABLE)
      .select({
        maxRecords: 10,
        sort: [{ field: "Created Time", direction: "desc" }],
      })
      .firstPage();

    if (records.length === 0) {
      console.log("No leads found.");
    } else {
      console.log(`Found ${records.length} recent leads:`);
      records.forEach((record) => {
        console.log(`- ID: ${record.id}`);
        console.log(`  Name: ${record.get("Full Name")}`);
        console.log(`  Email: ${record.get("Email")}`);
        console.log(`  Stage: ${record.get("Sales Stage")}`);
        console.log(`  Score: ${record.get("Lead Score")}`);
        console.log(`  Created: ${record.get("Created Time")}`);
        console.log("---");
      });
    }
  } catch (error) {
    console.error("Error checking leads:", error);
  }
}

checkRecentLeads();

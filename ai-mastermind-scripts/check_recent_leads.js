const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.resolve(process.cwd(), 'jab-cloud-gateway/.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  // Simple env parser
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim().replace(/^\uFEFF/, ''); // remove potential BOM from key
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

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
    // Try to list without sort first, then print field names if possible
    const records = await base(LEADS_TABLE)
      .select({
        maxRecords: 5,
        // Remove sort to see what's in there
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
        console.log(`  Created: ${record.get("Created Time") || record.get("Created At") || "N/A"}`);
        // Log all fields to debug
        // console.log("Fields:", Object.keys(record.fields));
        console.log("---");
      });
    }
  } catch (error) {
    console.error("Error checking leads:", error);
  }
}

checkRecentLeads();

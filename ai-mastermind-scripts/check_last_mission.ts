import Airtable from 'airtable';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);
const TABLE_NAME = "Challenges";

async function main() {
  console.log("Fetching last mission ID...");
  
  try {
    const records = await base(TABLE_NAME).select({
      sort: [{ field: "Challenge ID", direction: "desc" }],
      maxRecords: 1,
    }).firstPage();

    if (records.length > 0) {
      console.log(`Last Mission ID: ${records[0].get('Challenge ID')}`);
      console.log(`Last Mission Name: ${records[0].get('Challenge Name')}`);
    } else {
      console.log("No missions found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();

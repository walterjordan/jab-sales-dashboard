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
  const categories = new Set();
  try {
    const records = await base(TABLE_NAME).select({
      fields: ["Difficulty Level"],
      maxRecords: 50,
    }).all();

    records.forEach(r => {
      const cat = r.get("Difficulty Level");
      if (cat) categories.add(cat);
    });

    console.log("Existing Difficulties:", Array.from(categories));
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
}

main();

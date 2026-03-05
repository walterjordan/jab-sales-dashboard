import Airtable from 'airtable';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config(); // Fallback to .env
}

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error("Error: Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in environment variables.");
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const TABLE_NAME = "Learning Resources";

async function main() {
  const resources: any[] = [];
  
  console.log(`Fetching resources from table '${TABLE_NAME}'...`);

  try {
    await base(TABLE_NAME).select({
      // Fetch records where URL is not empty and Active is checked (1)
      filterByFormula: "AND({URL} != '', {Active} = 1)",
    }).eachPage((records, fetchNextPage) => {
      records.forEach((record) => {
        resources.push({
          id: record.id,
          title: record.get('Title'),
          url: record.get('URL'),
          type: record.get('Type')
        });
      });
      fetchNextPage();
    });
    
    const outputPath = path.resolve(process.cwd(), 'learning_resources.json');
    fs.writeFileSync(outputPath, JSON.stringify(resources, null, 2));
    console.log(`Successfully exported ${resources.length} resources to ${outputPath}`);
  } catch (err) {
    console.error("Error fetching resources:", err);
    process.exit(1);
  }
}

main();

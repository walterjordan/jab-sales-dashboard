
import { getAirtableBase } from "../src/lib/airtable";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyScore() {
  const { getAirtableBase } = await import("../src/lib/airtable");
  const base = getAirtableBase();
  const table = base("Submissions");
  const recordId = "recPsZVwUJXgH3Vni";

  console.log(`Fetching record: ${recordId}`);
  const record = await table.find(recordId);
  
  console.log("Field 'AI Score':", record.get("AI Score"));
  console.log("Field 'Score':", record.get("Score")); // Maybe it's called Score?
  console.log("All Fields:", Object.keys(record.fields));
}

verifyScore().catch(console.error);

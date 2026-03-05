
import { getAirtableBase } from "../src/lib/airtable";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function forcePass() {
  const { getAirtableBase } = await import("../src/lib/airtable");
  const base = getAirtableBase();
  const table = base("Submissions");
  const recordId = "recPsZVwUJXgH3Vni";

  console.log(`Force-passing submission: ${recordId}`);
  
  await table.update(recordId, {
      "Status": "Approved",
      "AI Score": 100,
      "AI Summary": "MANUAL FORCE PASS FOR WEBHOOK VERIFICATION."
  });
  
  console.log("✅ Done. Now go to Make.com and 'Run Once' the HTTP module with this ID.");
}

forcePass().catch(console.error);

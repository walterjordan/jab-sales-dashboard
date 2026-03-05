
import { getAirtableBase } from "../src/lib/airtable";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyAndFix() {
  const { getAirtableBase } = await import("../src/lib/airtable");
  const base = getAirtableBase();
  const table = base("Submissions");
  const recordId = "recPsZVwUJXgH3Vni"; // Use the existing submission

  console.log(`Checking record ${recordId}...`);
  let record = await table.find(recordId);
  console.log(`Current Score: ${record.get("AI Score")}`);

  if (Number(record.get("AI Score")) !== 100) {
      console.log(`Fixing score to 100...`);
      await table.update(recordId, {
          "AI Score": 100,
          "Status": "Approved"
      });
      // Verification
      record = await table.find(recordId);
      console.log(`New Score: ${record.get("AI Score")}`);
  }
  
  if (Number(record.get("AI Score")) === 100) {
      console.log(`✅ READY! Run the Make.com HTTP module NOW.`);
  } else {
      console.log(`❌ Update failed.`);
  }
}

verifyAndFix().catch(console.error);

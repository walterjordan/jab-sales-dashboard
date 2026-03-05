
import { getAirtableBase } from "../src/lib/airtable";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyWithGoldStandard() {
  const { getAirtableBase } = await import("../src/lib/airtable");
  const base = getAirtableBase();
  const submissionsTable = base(process.env.AIRTABLE_SUBMISSIONS_TABLE || "Submissions");
  const participantsTable = base(process.env.AIRTABLE_PARTICIPANTS_TABLE || "Participants");
  const progressTable = base(process.env.AIRTABLE_BADGE_PROGRESS_TABLE || "Badge Progress");

  const participantName = "Walter Jordan";
  const missionId = "119";
  const challengeName = "Mission 119: The Prompt Architect (Mastering Structure)";

  console.log(`
--- VERIFICATION: GOLD STANDARD MISSION 119 ---`);

  // 1. Get Participant ID
  const pRecords = await participantsTable.select({
      filterByFormula: `{Full Name} = "${participantName}"`,
      maxRecords: 1
  }).firstPage();
  const participantId = pRecords[0].id;

  // 2. High-Quality "Gold Standard" Content
  const goldStandardContent = `
  MISSION 119 SUBMISSION: PROMPT ARCHITECTURE FOR A SYSTEM ARCHITECT
  
  ROLE: You are an expert Senior Cloud Architect with 20 years of experience in distributed systems.
  
  CONTEXT: I am designing a real-time inventory management system for a global retail brand. We are debating between using a synchronous REST API or an asynchronous Event-Driven architecture (Kafka/RabbitMQ).
  
  TASK: Provide a technical trade-off analysis between these two patterns, specifically focusing on data consistency (CAP theorem) and latency.
  
  CONSTRAINTS: 
  - Must use clear bullet points.
  - Must provide a recommendation for a system that needs 99.99% availability.
  - Limit the response to 500 words.
  
  MASTERMIND FRAMEWORK APPLICATION:
  1. TRAP: The biggest trap is choosing REST because it is "simpler" initially, but failing to scale when millions of inventory updates hit the database at once.
  2. TOOL: I used the "System Architect" persona and a "Trade-off Matrix" as my tools.
  3. BUILD: I built a prompt that forced the AI to consider "Eventual Consistency" vs "Strong Consistency."
  4. VERIFY: I verified the output by checking if it mentioned the "Outbox Pattern" for reliable event delivery.
  
  This is a complete, structured prompt designed for professional architectural evaluation.
  `;

  console.log(`
1. Creating Gold Standard Submission...`);
  const createdRecord = await submissionsTable.create({
    "Participant": [participantId],
    "Mission ID": missionId,
    "Challenge Name": challengeName,
    "Submission Text": goldStandardContent,
    "Status": "Needs Review"
  });

  console.log(`   ✅ Created Submission Record: ${createdRecord.id}`);
  console.log(`   Waiting 60 seconds for Make.com + Production Webhook...`);
  
  await new Promise(resolve => setTimeout(resolve, 60000));

  // 3. Check Result
  console.log(`
2. Verifying Result...`);
  
  const subCheck = await submissionsTable.find(createdRecord.id);
  const status = subCheck.get("Status");
  const score = Number(subCheck.get("AI Score") || 0);
  
  console.log(`   Submission Status: ${status}`);
  console.log(`   Submission Score: ${score}`);

  if (score < 70) {
      console.log(`
❌ AI Grader still rejected the content. Score: ${score}`);
      console.log(`   AI Summary: ${subCheck.get("AI Summary")}`);
  } else {
      console.log(`
🎉 WE PASSED! Checking for Badge Progress...`);
      const badges = await progressTable.select({
           filterByFormula: `AND({Participant Name} = "${participantName}", {Badge Name} = "Prompt Architect")`
      }).all();
      
      const latest = [...badges].sort((a, b) => (b as any)._rawJson.createdTime.localeCompare((a as any)._rawJson.createdTime))[0];
      
      if (latest && (Date.now() - new Date((latest as any)._rawJson.createdTime).getTime()) < 120000) {
          console.log(`
🏆 SUCCESS! THE END-TO-END FLOW IS WORKING.`);
          console.log(`   Badge Progress ID: ${latest.id}`);
          console.log(`   Name: "${latest.get("Name")}"`);
      } else {
          console.log(`
❌ Pass achieved, but NO Badge was created.`);
          console.log(`   This means the JSON fix is correct, but the API endpoint might have an error.`);
          console.log(`   Check your Make.com HTTP module response body for the error message.`);
      }
  }
}

verifyWithGoldStandard().catch(console.error);

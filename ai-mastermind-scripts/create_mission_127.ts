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
const CHALLENGES_TABLE = "Challenges";
const RESOURCES_TABLE = "Learning Resources";

async function main() {
  console.log("Creating Mission 127: The Knowledge Engine...");

  try {
    // 1. Find the "Primary" resource for this mission (The NotebookLM Tool)
    // We'll search for "NotebookLM" in the Learning Resources table
    const resourceRecords = await base(RESOURCES_TABLE).select({
      filterByFormula: "{Title} = 'NotebookLM'",
      maxRecords: 1,
    }).firstPage();

    let notebookLmResourceId: string | undefined;
    if (resourceRecords.length > 0) {
      notebookLmResourceId = resourceRecords[0].id;
      console.log(`Found NotebookLM resource ID: ${notebookLmResourceId}`);
    } else {
      console.warn("NotebookLM resource not found. Creating it...");
      const newRes = await base(RESOURCES_TABLE).create({
        "Title": "NotebookLM",
        "URL": "https://notebooklm.google.com/",
        "Type": "Tool",
        "Active": true
      });
      notebookLmResourceId = newRes.id;
    }

    // 2. Create the Mission
    const missionData = {
      "Challenge ID": 127,
      "Challenge Name": "Mission 127: The Knowledge Engine",
      "Status": "Active",
      "Category": "Workflows",
      "XP Value": 350,
      "Difficulty Level": "Veteran",
      "Mission Objective": "Synthesize the entire AI Mastermind curriculum into a single interactive knowledge base using Google NotebookLM.",
      "Hands-On Activity": `1. **Access:** Open Google NotebookLM.
2. **Ingest:** Use the provided script or manually add the 'learning_resources.json' file to a new notebook.
3. **Synthesize:** Generate an Audio Overview that summarizes the key themes of the curriculum.
4. **Verify:** Share the public link to your Audio Overview as the submission.`,
      "Deliverables": "The public link to your NotebookLM Audio Overview.",
      "Unlock Requirements": "Complete Mission 126",
      "NotebookLM Prompts": "What are the core themes of the AI Mastermind curriculum? Identify the top 3 most referenced tools.",
      "Learning Resources": [notebookLmResourceId]
    };

    const record = await base(CHALLENGES_TABLE).create([
      { fields: missionData }
    ]);

    console.log(`Successfully created Mission 127 (ID: ${record[0].id})`);

  } catch (err) {
    console.error("Error creating mission:", err);
  }
}

main();

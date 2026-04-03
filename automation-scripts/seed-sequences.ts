import { TABLES } from '../utils/airtable';
import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = 'appeJqZ5yjyPmh1MC';
const base = new Airtable({ apiKey }).base(baseId);

const sequences = [
  {
    StepNumber: 1,
    DelayMinutes: 0,
    Channel: 'SMS',
    MessageTemplate: 'Hi {{BusinessName}}, I noticed some missed opportunities in your current setup. Would you be open to a quick chat about how AI can help automate your follow-ups?'
  },
  {
    StepNumber: 2,
    DelayMinutes: 60, // 1 hour later
    Channel: 'SMS',
    MessageTemplate: 'Hey {{firstName}}, just wanted to make sure this didn’t slip through — quick question for you 👇'
  },
  {
    StepNumber: 3,
    DelayMinutes: 480, // 8 hours later (end of day)
    Channel: 'EMAIL',
    MessageTemplate: 'Subject: Checking in - {{BusinessName}}\n\nHi {{firstName}},\n\nI sent a couple of texts earlier but wanted to try you here as well. We help {{Industry}} businesses in {{City}} automate their sales process.\n\nAre you available for a brief call tomorrow?'
  },
  {
    StepNumber: 4,
    DelayMinutes: 1440, // 24 hours later
    Channel: 'SMS',
    MessageTemplate: 'Still interested in those automation tools for {{BusinessName}}? Let me know!'
  },
  {
    StepNumber: 5,
    DelayMinutes: 2880, // 48 hours later
    Channel: 'CALL',
    MessageTemplate: 'Manual Call required for {{BusinessName}}'
  },
  {
    StepNumber: 6,
    DelayMinutes: 4320, // 72 hours later
    Channel: 'SMS',
    MessageTemplate: 'I’ll take your silence as a "not right now." If things change at {{BusinessName}}, feel free to reach back out. Best of luck!'
  }
];

async function seedSequences() {
  console.log('Seeding FollowUpSequences...');
  
  for (const seq of sequences) {
    await base(TABLES.FOLLOW_UP_SEQUENCES).create([
      {
        fields: {
          'Sequence ID': `SEQ_STEP_${seq.StepNumber}`,
          ...seq
        }
      }
    ]);
    console.log(`Created Step ${seq.StepNumber}`);
  }
  
  console.log('Seeding complete.');
}

seedSequences().catch(console.error);

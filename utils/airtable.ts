import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = 'appeJqZ5yjyPmh1MC';

if (!apiKey) {
  throw new Error('AIRTABLE_API_KEY is not set in environment variables');
}

const base = new Airtable({ apiKey }).base(baseId);

// Table IDs
export const TABLES = {
  LEADS: 'tblXC5DVlvsecX8GC',
  CONVERSATIONS: 'tblHHtMcNrH9RocXN',
  FOLLOW_UP_SEQUENCES: 'tbl13hxheWS7wZLIr',
  TASKS: 'tble6t6VXf0rhNVmt'
};

export async function getLeadsDue() {
  const now = new Date().toISOString();
  const formula = `AND(
    {FollowUpStatus} != 'CLOSED_WON',
    {FollowUpStatus} != 'CLOSED_LOST',
    {NextActionAt} <= '${now}'
  )`;

  const records = await base(TABLES.LEADS)
    .select({
      filterByFormula: formula,
    })
    .all();

  return records.map((r) => ({
    id: r.id,
    ...r.fields,
  }));
}

export async function updateLead(leadId: string, fields: any) {
  return base(TABLES.LEADS).update(leadId, fields);
}

export async function getSequences() {
  const records = await base(TABLES.FOLLOW_UP_SEQUENCES)
    .select({
      sort: [{ field: 'StepNumber', direction: 'asc' }],
    })
    .all();

  return records.map((r) => ({
    id: r.id,
    ...r.fields,
  }));
}

export async function createTask(leadId: string, taskType: string, notes: string, dueAt: string) {
  return base(TABLES.TASKS).create([
    {
      fields: {
        'Task Name': `Task for ${leadId}`,
        'Lead': [leadId],
        'TaskType': taskType,
        'Status': 'PENDING',
        'Notes': notes,
        'DueAt': dueAt
      },
    },
  ]);
}

export async function appendConversationMessage(leadId: string, channel: string, direction: string, content: string) {
  return base(TABLES.CONVERSATIONS).create([
    {
      fields: {
        'Lead': [leadId],
        'Type': channel,
        'Message': content,
        'Timestamp': new Date().toISOString()
      },
    },
  ]);
}

import { google } from 'googleapis';
import { updateLead, appendConversationMessage, TABLES } from '../utils/airtable';
import Airtable from 'airtable';
import dotenv from 'dotenv';
import { handleInboundMessage } from './response-handler';

dotenv.config();

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = 'appeJqZ5yjyPmh1MC';
const base = new Airtable({ apiKey }).base(baseId);

export async function syncGmailReplies() {
  console.log('[GmailSync] Checking for new email replies...');
  
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('[GmailSync] Missing credentials.');
    return;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // 1. Fetch recent messages (only from INBOX)
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread category:primary',
      maxResults: 20
    });

    const messages = res.data.messages || [];
    console.log(`[GmailSync] Found ${messages.length} unread messages.`);

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!
      });

      const headers = detail.data.payload?.headers || [];
      const fromHeader = headers.find(h => h.name === 'From')?.value || '';
      const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '';
      
      // Extract email address from "Name <email@example.com>"
      const emailMatch = fromHeader.match(/<(.+)>|(\S+@\S+)/);
      const senderEmail = emailMatch ? (emailMatch[1] || emailMatch[2]) : fromHeader;

      if (!senderEmail) continue;

      console.log(`[GmailSync] Message from: ${senderEmail}. Subject: ${subjectHeader}`);

      // 2. Find Lead in Airtable
      const leads = await base(TABLES.LEADS).select({
        filterByFormula: `{Email} = '${senderEmail}'`,
        maxRecords: 1
      }).all();

      if (leads.length > 0) {
        const lead = { id: leads[0].id, ...leads[0].fields };
        console.log(`[GmailSync] Matching lead found: ${lead.id}`);

        // Extract body (simplified)
        const part = detail.data.payload?.parts?.[0] || detail.data.payload;
        const body = part?.body?.data ? Buffer.from(part.body.data, 'base64').toString() : 'No body content found.';

        // 3. Process as Inbound Response
        await handleInboundMessage(lead, body, 'EMAIL');
        
        // 4. Mark message as read (remove UNREAD label)
        await gmail.users.messages.batchModify({
          userId: 'me',
          ids: [msg.id!],
          removeLabelIds: ['UNREAD']
        });
        
        console.log(`[GmailSync] Successfully synced reply from ${senderEmail} and marked as read.`);
      } else {
        console.log(`[GmailSync] No matching lead found for ${senderEmail}. Skipping.`);
      }
    }
  } catch (err: any) {
    console.error('[GmailSync] Error:', err.message);
  }
}

if (require.main === module) {
  syncGmailReplies().catch(console.error);
}

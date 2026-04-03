import { updateLead, appendConversationMessage } from '../utils/airtable';
import { classify } from '../services/ai-classifier';

export async function handleInboundMessage(lead: any, message: string, channel: string) {
  console.log(`[ResponseHandler] Processing inbound from ${lead.id} on ${channel}: ${message.slice(0, 50)}...`);
  
  // 1. Log the inbound message
  await appendConversationMessage(lead.id, channel, 'Inbound', message);
  
  // 2. Classify the response
  const classification = await classify(message);
  console.log(`[ResponseHandler] Classification: ${classification}`);
  
  // 3. Update Lead State
  const updateFields: any = {
    LastResponseAt: new Date().toISOString(),
    FollowUpStatus: 'ENGAGED',
    NextActionAt: null, // Pause automated follow-ups
  };
  
  if (classification === 'INTERESTED') {
    updateFields.EngagementLevel = 'HIGH';
  } else if (classification === 'NOT_INTERESTED') {
    updateFields.FollowUpStatus = 'CLOSED_LOST';
  } else if (classification === 'BUSY') {
    // Resume follow-up in 24 hours
    const nextDate = new Date();
    nextDate.setHours(nextDate.getHours() + 24);
    updateFields.NextActionAt = nextDate.toISOString();
    updateFields.EngagementLevel = 'MEDIUM';
  } else if (classification === 'OBJECTION') {
    updateFields.EngagementLevel = 'MEDIUM';
  } else {
    updateFields.EngagementLevel = 'MEDIUM';
  }
  
  await updateLead(lead.id, updateFields);
  console.log(`[ResponseHandler] Lead ${lead.id} state updated.`);
  
  return { classification };
}

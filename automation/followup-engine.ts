import { getLeadsDue, getSequences, updateLead, appendConversationMessage, createTask } from '../utils/airtable';
import { sendSMS } from '../utils/messaging';
import { sendEmail } from '../utils/email';
import { buildContext } from '../services/context-builder';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function runFollowUpEngine() {
  console.log('[Engine] Running Follow-Up Engine...');
  
  const leads = await getLeadsDue();
  const allSequences = await getSequences();
  
  if (leads.length === 0) {
    console.log('[Engine] No leads due for follow-up.');
    return;
  }
  
  console.log(`[Engine] Found ${leads.length} leads due for follow-up.`);
  
  for (const leadRecord of leads) {
    const lead = leadRecord as any;
    try {
      const currentStep = lead.FollowUpStep || 1;
      const sequence = allSequences.find((s: any) => s.StepNumber === currentStep) as any;
      
      if (!sequence) {
        console.log(`[Engine] No sequence found for step ${currentStep} for lead ${lead.id}. Marking as CLOSED_LOST.`);
        await updateLead(lead.id, { FollowUpStatus: 'CLOSED_LOST' });
        continue;
      }
      
      // Build context for AI-driven personalization
      const context = buildContext(lead);
      const personalizedMessage = await generatePersonalizedMessage(sequence.MessageTemplate, context);
      
      let success = false;
      console.log(`[Engine] Lead ${lead.id} at step ${currentStep} (${sequence.Channel}).`);
      
      if (sequence.Channel === 'SMS') {
        if (lead.phone_e164) {
          const res = await sendSMS(lead.phone_e164, personalizedMessage);
          success = res.success;
        } else {
          console.warn(`[Engine] Lead ${lead.id} missing phone_e164 for SMS.`);
        }
      } else if (sequence.Channel === 'EMAIL') {
        if (lead.Email) {
          const parts = personalizedMessage.split('\n\n');
          let subject = `Question for ${context.businessName}`;
          let body = personalizedMessage;
          
          if (parts[0].startsWith('Subject: ')) {
             subject = parts[0].replace('Subject: ', '');
             body = parts.slice(1).join('\n\n');
          }
          
          const res = await sendEmail(lead.Email, subject, body);
          success = res.success;
        } else {
          console.warn(`[Engine] Lead ${lead.id} missing email for outreach.`);
        }
      } else if (sequence.Channel === 'CALL') {
        await createTask(lead.id, 'CALL', `Follow-up Step ${currentStep} manual call required for ${context.businessName}.`, new Date().toISOString());
        success = true;
      }
      
      if (success) {
        if (sequence.Channel !== 'CALL') {
            await appendConversationMessage(lead.id, sequence.Channel, 'Outbound', personalizedMessage);
        }
        
        const nextStep = currentStep + 1;
        const nextSequence = allSequences.find((s: any) => s.StepNumber === nextStep) as any;
        let nextActionAt = null;
        
        if (nextSequence) {
            const delayMinutes = nextSequence.DelayMinutes || 0;
            const nextDate = new Date();
            nextDate.setMinutes(nextDate.getMinutes() + delayMinutes);
            nextActionAt = nextDate.toISOString();
        }
        
        await updateLead(lead.id, {
          FollowUpStep: nextStep,
          LastContactedAt: new Date().toISOString(),
          NextActionAt: nextActionAt,
          FollowUpStatus: 'CONTACTED'
        });
        
        console.log(`[Engine] Lead ${lead.id} updated. Next step: ${nextStep}.`);
      }
      
    } catch (err: any) {
      console.error(`[Engine] Error for lead ${lead.id}:`, err.message);
    }
  }
}

async function generatePersonalizedMessage(template: string, context: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Basic fallback replacement
    let msg = template;
    msg = msg.replace('{{BusinessName}}', context.businessName);
    msg = msg.replace('{{firstName}}', context.businessName.split(' ')[0]);
    msg = msg.replace('{{Industry}}', context.industry);
    msg = msg.replace('{{City}}', context.city);
    return msg;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Personalize this sales message based on the business context. 
            Keep it under 2 sentences. Conversational tone. 
            Context: Business: ${context.businessName}, Industry: ${context.industry}, City: ${context.city}.`
          },
          {
            role: 'user',
            content: `Template: ${template}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err: any) {
    console.error('[Engine] Personalization Error:', err.message);
    return template; // Fallback
  }
}

if (require.main === module) {
  runFollowUpEngine().catch(console.error);
}

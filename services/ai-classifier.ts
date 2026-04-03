import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function classify(message: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[Classifier] Missing OPENAI_API_KEY. Using basic regex fallback.');
    return basicClassify(message);
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Cost-effective but smart enough
        messages: [
          {
            role: 'system',
            content: `Classify the following customer response for a sales follow-up system. 
            Return ONLY ONE of these keywords: INTERESTED, NOT_INTERESTED, OBJECTION, BUSY, UNKNOWN.
            
            INTERESTED: Positive intent, asking for more info, price, or meeting.
            NOT_INTERESTED: Explicitly saying no, unsubscribe, stop, not for us.
            OBJECTION: Asking "who is this?", "how did you get my number?", or raising a specific concern.
            BUSY: "Call me later", "traveling", "too busy right now", "not now but maybe later".
            UNKNOWN: Generic greeting or anything else.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 10,
        temperature: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const classification = response.data.choices[0].message.content.trim().toUpperCase();
    return ['INTERESTED', 'NOT_INTERESTED', 'OBJECTION', 'BUSY', 'UNKNOWN'].includes(classification) 
      ? classification 
      : 'UNKNOWN';
  } catch (err: any) {
    console.error('[Classifier] OpenAI API Error:', err.message);
    return basicClassify(message);
  }
}

function basicClassify(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('not interested') || lower.includes('stop') || lower.includes('unsubscribe')) return 'NOT_INTERESTED';
  if (lower.includes('busy') || lower.includes('later') || lower.includes('traveling')) return 'BUSY';
  if (lower.includes('yes') || lower.includes('interested') || lower.includes('how much') || lower.includes('price')) return 'INTERESTED';
  if (lower.includes('who') || lower.includes('how did you')) return 'OBJECTION';
  return 'UNKNOWN';
}

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function generateCallBrief(lead: any, conversationHistory: any[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return 'Detailed call brief unavailable (Missing OpenAI API Key). Please review Airtable history.';
  }

  try {
    const historyText = conversationHistory
      .map(m => `${m.direction} (${m.channel}): ${m.content}`)
      .join('\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a sales assistant helping a human closer prepare for a call. 
            Summarize the business, the last interactions, and suggest an opener and pitch angle.`
          },
          {
            role: 'user',
            content: `
            Business: ${lead.BusinessName}
            Industry: ${lead.Industry}
            City: ${lead.City}
            History:
            ${historyText}
            `
          }
        ],
        max_tokens: 300,
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
    console.error('[CallBrief] Error:', err.message);
    return 'Error generating brief. Manual review recommended.';
  }
}

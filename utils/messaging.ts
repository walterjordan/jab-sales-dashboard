import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function sendSMS(phoneNumber: string, text: string) {
  const apiKey = process.env.Textlinksms_api_key;
  if (!apiKey) {
    console.warn('[Messaging] Missing Textlinksms_api_key. SMS sending skipped.');
    return { success: false, error: 'Missing API Key' };
  }

  try {
    const response = await axios.post(
      'https://textlinksms.com/api/send-sms',
      {
        phone_number: phoneNumber,
        text: text,
        sim_card_id: 1253 // Consistent with jab-cloud-gateway
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[Messaging] TextLink API response:`, response.data);
    return { success: response.data.ok !== false, data: response.data };
  } catch (err: any) {
    console.error(`[Messaging] Error sending SMS:`, err.response?.data || err.message);
    return { success: false, error: err.message };
  }
}

export async function sendMessenger(psid: string, text: string) {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.warn('[Messaging] Missing FACEBOOK_PAGE_ACCESS_TOKEN. Messenger sending skipped.');
    return { success: false, error: 'Missing API Key' };
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
      {
        recipient: { id: psid },
        message: { text }
      }
    );
    return { success: true, data: response.data };
  } catch (err: any) {
    console.error(`[Messaging] Error sending Messenger message:`, err.response?.data || err.message);
    return { success: false, error: err.message };
  }
}

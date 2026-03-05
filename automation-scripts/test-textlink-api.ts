import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../jab-cloud-gateway/.env.local') });

const apiKey = "U8LMO1Wv42peLkqQpC7BC8LGntdWIUecYrQYCA5bGBiQgR707ya3uIC2VLZ8jenr"; // From env.yaml if local .env is missing it

async function testSMS() {
    console.log("Testing TextLink SMS directly via API...");
    try {
        const response = await axios.post('https://textlink.sh/api/send', {
            phone_number: "+14044728413",
            text: "Direct API test from JAB Sales Agent automation."
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);
    } catch (error: any) {
        console.error("Error sending SMS:", error.response?.data || error.message);
    }
}

testSMS();

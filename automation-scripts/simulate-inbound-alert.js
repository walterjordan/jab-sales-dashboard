const axios = require('axios');

async function simulateInboundAlert() {
    // You can change this to 'SMS' or 'Messenger'
    const channel = 'SMS';
    const senderId = '+14046001446'; // Atlanta Dental Center (one of your leads)
    const text = 'Is this for real? I am interested in the AI tool.';

    console.log(`Simulating inbound ${channel} message from ${senderId}...`);
    
    try {
        // Calling your local dev server
        const response = await axios.post('http://localhost:3000/api/webhooks/textlink', {
            secret: 'JORDOWENS',
            phone_number: senderId,
            text: text
        });
        
        console.log('Webhook Response:', response.status, response.statusText);
        console.log('Check your terminal where npm run dev is running for the [Event Gateway] logs!');
    } catch (err) {
        console.error('Failed to simulate:', err.response?.data || err.message);
    }
}

simulateInboundAlert();

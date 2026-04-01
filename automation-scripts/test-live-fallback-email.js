const axios = require('axios');

async function sendClientFallbackTest() {
    const to = 'walterjordan@jordanborden.com';
    const subject = 'Quick question for Walter';
    const body = `
        <div style='font-family: sans-serif; color: #1a1a2e; line-height: 1.6;'>
            <p>Hi Walter,</p>
            <p>I noticed you're currently taking on new clients, but we couldn't reach your mobile.</p>
            <p>I have a specialized AI tool that automates lead follow-up so you never miss a booking or a potential close. It handles the "speed to lead" problem so your team can focus on the actual service.</p>
            <p>Would you be open to a quick 90-minute workshop where we show you exactly how to implement this?</p>
            <p>You can check out some of our work here: <a href='https://jordanborden.com' style='color: #0066ff;'>jordanborden.com</a><br>
            Or book directly into a workshop here: <a href='https://aimastermind.jordanborden.com' style='color: #0066ff;'>aimastermind.jordanborden.com</a></p>
            <br>
            <p>Best,</p>
            <p><b>Jordan</b><br>
            <span style='color: #666; font-size: 12px;'>Jordan & Borden Support</span></p>
        </div>
    `;

    console.log('Sending client fallback template...');
    
    try {
        const response = await axios.post('http://localhost:8080/sse', {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'send_email',
                arguments: { to, subject, body, lead_id: null }
            }
        });
        
        console.log('Response:', response.data.result.content[0].text);
    } catch (err) {
        console.error('Failed:', err.response?.data || err.message);
    }
}

sendClientFallbackTest();

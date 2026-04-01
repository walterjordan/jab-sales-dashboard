const axios = require('axios');

async function sendTestEmail() {
    const leadId = "recTEST123";
    const to = "walterjordan@jordanborden.com";
    const subject = "🚀 JAB Sales Master — Live Delivery Confirmed";
    const body = `
        <div style="font-family: sans-serif; color: #0a0a23; line-height: 1.6;">
            <h1 style="color: #0066ff;">Impressive Delivery, Walter.</h1>
            <p>This email was sent via the <b>JAB Sales Master Agent</b> using the real Gmail API from <b>support@jordanborden.com</b>.</p>
            <p>Your "Masterbuild" is now fully operational with:</p>
            <ul>
                <li><b>Smart Outreach:</b> Programmatic routing between SMS and Email.</li>
                <li><b>Line Intelligence:</b> Twilio-powered mobile vs landline detection.</li>
                <li><b>Lead Enrichment:</b> Hunter.io automated email discovery.</li>
                <li><b>Live UI:</b> Real-time status badges on your dashboard.</li>
            </ul>
            <p style="margin-top: 20px;">Ready to dominate the Greater Atlanta market.</p>
            <p>Best,<br><b>JAB Sales Master</b></p>
        </div>
    `;

    console.log("Triggering live email delivery through MCP...");
    
    try {
        const response = await axios.post("http://localhost:8080/sse", {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
                name: "send_email",
                arguments: {
                    to,
                    subject,
                    body,
                    lead_id: null // Skipping Airtable logging for this one-off test
                }
            }
        });
        
        console.log("Response from MCP:", response.data.result.content[0].text);
    } catch (err) {
        console.error("Failed to trigger email:", err.response?.data || err.message);
    }
}

sendTestEmail();

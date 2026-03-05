const apiKey = "ng6DeHH02LMO5HJVISZYsxQMYISUxQNVChetReuwUgTKrKEnIKHu5gvm0qr9ofZ4";

async function testSMS() {
    console.log("Testing TextLink API with sim_card_id 1253...");
    try {
        const response = await fetch('https://textlinksms.com/api/send-sms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: "+14044728413",
                text: "Test using direct fetch with sim_card_id 1253 and new API key.",
                sim_card_id: 1253
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testSMS();

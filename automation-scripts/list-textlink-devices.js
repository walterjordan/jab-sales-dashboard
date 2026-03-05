const apiKey = "U8LMO1Wv42peLkqQpC7BC8LGntdWIUecYrQYCA5bGBiQgR707ya3uIC2VLZ8jenr";

async function listDevices() {
    console.log("Listing TextLink devices...");
    try {
        const response = await fetch('https://textlinksms.com/api/get-devices', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listDevices();

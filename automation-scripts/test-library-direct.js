const textlink = require("textlink-sms");

const apiKey = "U8LMO1Wv42peLkqQpC7BC8LGntdWIUecYrQYCA5bGBiQgR707ya3uIC2VLZ8jenr";
textlink.useKey(apiKey);

async function test() {
    console.log("Testing textlink-sms library with source_country US...");
    try {
        const result = await textlink.sendSMS("+14044728413", "Hello from US source country!", "US");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();


async function checkMakeMCP() {
    const url = "https://us2.make.com/mcp/server/18d1a69c-7de4-4c86-abbe-5ae1afca9052";
    const apiKey = "uH-rUuCnBuscATTmlkbWTs5Iq-vmnbO8bUCDrTHolP";
    
    try {
        console.log("Fetching tools from Make.com MCP (SSE format)...");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "text/event-stream, application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "1",
                method: "tools/list",
                params: {}
            })
        });
        
        const text = await response.text();
        console.log("Raw Response:", text);
    } catch (err: any) {
        console.error("Error connecting to Make.com MCP:", err);
    }
}

checkMakeMCP();


import { Runner, Agent, hostedMcpTool } from "@openai/agents";

async function testBookingIntent() {
  console.log("🚀 Testing AI Agent's response to a 'Book Call' intent...");

  // 1. Setup the tool exactly as it is in agents.ts
  const makeMCP = hostedMcpTool({
    serverLabel: "make_com_integration",
    serverUrl: "https://us2.make.com/mcp/server/18d1a69c-7de4-4c86-abbe-5ae1afca9052",
    authorization: "uH-rUuCnBuscATTmlkbWTs5Iq-vmnbO8bUCDrTHolP",
    allowedTools: ["t397_01_jab_sales_agent"],
    requireApproval: "never"
  });

  const testAgent = new Agent({
    name: "BookingTester",
    instructions: `CRITICAL: You are a booking assistant. 
When a user provides a time and email, you MUST use the 't397_01_jab_sales_agent' tool BEFORE responding. 

TOOL SCHEMA for 't397_01_jab_sales_agent':
{
  "action": "string (set to 'book_call')",
  "email": "string",
  "date": "string",
  "name": "string (optional)"
}

Do not confirm the booking until the tool has been executed.`,
    model: "gpt-4o",
    tools: [makeMCP]
  });

  const runner = new Runner();
  
  // 2. Simulate the user providing their time after clicking the quick reply
  const result: any = await runner.run(testAgent, [
    { role: "user", content: "That sounds great. Can we chat this Thursday at 2:00 PM? My email is test@jordanborden.com" }
  ]);

  console.log("\n--- AGENT RESPONSE ---");
  console.log(result.finalOutput);
  
  // 3. Check if tool was called
  console.log("\n--- TOOL CALLS ---");
  const toolCalls = result.steps?.flatMap((s: any) => s.toolCalls || []) || [];
  if (toolCalls.length > 0) {
    toolCalls.forEach((tc: any) => {
      console.log(`Tool: ${tc.function.name}`);
      console.log(`Arguments: ${tc.function.arguments}`);
    });
  } else {
    console.log("No tools were called.");
  }
}

testBookingIntent().catch(console.error);

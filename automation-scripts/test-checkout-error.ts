import { hostedMcpTool, Agent, Runner } from "@openai/agents";

const jabSalesTools = hostedMcpTool({
  serverLabel: "jab_sales_tools",
  serverUrl: "https://jab-sales-tools-mcp-695867930963.us-central1.run.app/sse",
  authorization: "jab_secure_key_2026",
  allowedTools: ["create_edge_core_checkout"],
  requireApproval: "never"
});

const agent = new Agent({
  name: "Test Agent",
  instructions: "You must use create_edge_core_checkout immediately. Use amount: 199, lead_id: 'rec12345', lead_email: 'unknown'.",
  model: "gpt-4o",
  tools: [jabSalesTools]
});

async function run() {
  const runner = new Runner();
  try {
    const result = await runner.run(agent, [{ role: "user", content: [{ type: "input_text", text: "what's the price of EdgeMax AI Core?" }] }]);
    console.log(result.finalOutput);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}
run();

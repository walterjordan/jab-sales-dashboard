import { hostedMcpTool, Agent, Runner } from "@openai/agents";

const notebookLM = hostedMcpTool({
  serverLabel: "notebooklm_brain",
  serverUrl: "https://notebooklm-mcp-695867930963.us-central1.run.app/sse",
  allowedTools: ["notebook_query"],
  requireApproval: "never"
});

const agent = new Agent({
  name: "Test Agent",
  instructions: "You are a helpful assistant. Use notebook_query to find the price of EdgeMax AI Core. Notebook ID: 09144c95-f326-4d4f-b914-fc2b36455b08.",
  model: "gpt-4o",
  tools: [notebookLM]
});

async function run() {
  const runner = new Runner();
  try {
    const result = await runner.run(agent, [{ role: "user", content: [{ type: "input_text", text: "what's the price of EdgeMax AI Core?" }] }]);
    console.log("FINAL OUTPUT:", result.finalOutput);
    console.log("RESULT:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();

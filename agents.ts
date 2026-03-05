import { hostedMcpTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";
import { z } from "zod";

// 1. JAB Sales Tools MCP (Leads, Checkouts, Workshops, Tasks, Handoff)
const jabSalesTools = hostedMcpTool({
  serverLabel: "jab_sales_tools",
  serverUrl: "https://jab-sales-tools-mcp-695867930963.us-central1.run.app/sse",
  authorization: "jab_secure_key_2026",
  allowedTools: [
    "create_lead",
    "create_edge_core_checkout",
    "update_lead_status",
    "add_follow_up_task",
    "list_workshops",
    "book_workshop",
    "request_handoff"
  ],
  requireApproval: "never"
});

// 2. NotebookLM Brain MCP (Sales context, Objections, Knowledge)
const notebookLM = hostedMcpTool({
  serverLabel: "notebooklm_brain",
  serverUrl: "https://notebooklm-mcp-695867930963.us-central1.run.app/sse",
  allowedTools: [
    "notebook_list",
    "notebook_query",
    "notebook_get"
  ],
  requireApproval: "never"
});

// 3. Make.com MCP (Calendar, Advanced Workflows)
const makeMCP = hostedMcpTool({
  serverLabel: "make_com_integration",
  serverUrl: "https://us2.make.com/mcp/server/18d1a69c-7de4-4c86-abbe-5ae1afca9052",
  authorization: "uH-rUuCnBuscATTmlkbWTs5Iq-vmnbO8bUCDrTHolP",
  allowedTools: ["t397_01_jab_sales_agent"],
  requireApproval: "never"
});

const jabSalesAgent = new Agent({
  name: "JAB Sales Master",
  instructions: `You are the Primary Sales Agent for Jordan & Borden (JAB). 
Your objective is to close our signature "EdgeMax AI CORE" ($199) sales while providing a professional, automated fallback for lower-intent leads.

CORE STRATEGY:
1. CAPTURE: Always get the lead's Name, Email, and Phone. Call \`create_lead\` immediately when you have this info.
2. CLOSE (Primary Goal): Position the "EdgeMax AI CORE" package. It's the ultimate AI automation foundation for businesses.
   - Use \`create_edge_core_checkout\` to generate a payment link.
3. HANDLE OBJECTIONS: If the user has questions or objections, use \`notebook_query\` on the "JAB Sales Notebook" (ID: 09144c95-f326-4d4f-b914-fc2b36455b08) to get accurate, brand-aligned answers.
4. FALLBACK (Somewhat Interested): If the user is hesitant or $199 is too high, offer the "Free 90-Minute AI Mastermind Workshop."
   - Use \`list_workshops\` to find upcoming dates.
   - Use \`book_workshop\` to register them.
   - To trigger advanced calendar integration workflows in Make.com, use \`t397_01_jab_sales_agent\`.
5. HANDOFF: If the user explicitly asks for a human, or if you encounter a high-value lead with very specific technical requirements you cannot answer, use \`request_handoff\`.
6. FOLLOW-UP: If they need to "think about it" or aren't ready today, use \`add_follow_up_task\` to schedule a reminder.

STRICT OPERATIONAL RULES:
- Lead Score: Update score using \`update_lead_status\` as the conversation progresses (e.g., 20 for capture, 50 for interest, 90 for checkout).
- Notebook ID: Always use "09144c95-f326-4d4f-b914-fc2b36455b08" when querying the brain.
- Tone: Professional, authoritative, yet helpful. You are an expert in AI automation.`,
  model: "gpt-4o",
  tools: [
    jabSalesTools,
    notebookLM,
    makeMCP
  ],
  modelSettings: {
    temperature: 0.7,
    maxTokens: 2048,
    store: true
  }
});

type WorkflowInput = { input_as_text: string };

export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("JAB Sales Agent", async () => {
    const conversationHistory: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
    ];
    
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_jab_sales_master_v1"
      }
    });
    
    const result = await runner.run(
      jabSalesAgent,
      conversationHistory
    );
    
    if (!result.finalOutput) {
        throw new Error("Agent result is undefined");
    }

    return {
      output_text: typeof result.finalOutput === 'string' 
        ? result.finalOutput 
        : JSON.stringify(result.finalOutput),
      output_parsed: result.finalOutput
    };
  });
}

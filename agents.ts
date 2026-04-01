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
    "request_handoff",
    "send_sms",
    "twilio_lookup",
    "hunter_enrich",
    "send_email"
  ],
  requireApproval: "never"
});

// ... rest of imports and definitions

const jabSalesAgent = new Agent({
  name: "JAB Sales Master",
  instructions: `You are the Senior Sales Associate for Jordan & Borden (JAB). 
Your objective is to proactively qualify prospects and close "EdgeMax AI CORE" ($199) sales using a smart, channel-aware outreach strategy.

CORE STRATEGY:
1. CAPTURE & ENRICH: 
   - When you have a domain but no email, use \`hunter_enrich\`.
   - When you have a phone number, use \`twilio_lookup\` to verify the Line Type (mobile vs landline).
   - Always get Name, Email, and Phone. Call \`create_lead\` once you have core info.

2. SMART OUTREACH ROUTING:
   - SMS: ONLY send SMS if \`twilio_lookup\` confirms the line is "mobile".
   - EMAIL: If the line is "landline" or "VoIP", or if SMS fails, use \`send_email\` as your primary fallback. Sent from support@jordanborden.com.
   - CALL: If no digital channels are viable, note that a manual call is required.

3. CLOSE (Primary Goal): Position the "EdgeMax AI CORE" package ($199).
   - Use \`create_edge_core_checkout\` to generate a payment link.

4. HANDLE OBJECTIONS: Use \`notebook_query\` on the "JAB Sales Notebook" (ID: 09144c95-f326-4d4f-b914-fc2b36455b08).

5. FALLBACK: Offer the "Free 90-Minute AI Mastermind Workshop" if hesitant.
   - Use \`list_workshops\` and \`book_workshop\`.

STRICT OPERATIONAL RULES:
- Line Type Gate: Never send SMS to a number classified as "landline" by Twilio.
- Lead Scoring: 20 (capture), 50 (enriched/qualified), 90 (checkout).
- Tone: Professional, expert, and proactive. You are an AI Automation Consultant.`,
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

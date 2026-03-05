# JAB Cloud-First Customer Engagement + Sales OS: Implementation Plan v5

> **🛑 HOW TO RESUME IN YOUR NEXT SESSION**
> 1. Provide the agent with this exact prompt: *"We are resuming work on the JAB Sales Agent. Please read `theplan5.md` to get caught up."*

This document serves as the active blueprint for the autonomous execution of the JAB Cloud-First Customer Engagement + Sales OS, reflecting the completion of the omnichannel architecture and outlining the final integration and hardening phases.

## 1. Where We Are (Accomplishments)

### Phase 5: Omnichannel Architecture (COMPLETED)
- **Airtable Schema Upgraded:** 
  - `Leads` table enhanced with `primary_channel`, `messenger_psid`, `phone_e164`, `handoff_requested`, and Ad context fields.
  - `Conversations` table fully utilized as a unified transcript for SMS, Messenger, and Web Chat (`Channel`, `Direction`, `Content`, `Timestamp`).
- **Omnichannel MCP Tooling:** `jab-sales-tools-mcp` updated with `send_sms`, `append_conversation_message`, `get_conversation_context`, `get_lead_by_phone`, and `get_lead_by_messenger_psid`.
- **Webhook Gateway Deployed:** `jab-cloud-gateway` now hosts active public endpoints:
  - TextLinkSMS: `/webhook/inbound`, `/webhook/outbound`, `/webhook/failed`, `/webhook/tag`
  - Meta Messenger: `/api/webhooks/messenger`
- **Agent Intelligence:** The OpenAI Agent Builder instructions are updated (`jab-agent-omnichannel-instructions.md`) to handle cross-channel handoffs, mandatory conversation logging, and fallback workshop booking.
- **End-to-End Validation:** Mock payloads successfully generated Leads, triggered the Sales Agent, and logged outbound responses for both SMS and Messenger.

---

## 2. Where We Are Going (Next Steps)

### Phase 6: Make.com Integration & Automation Routing (NEXT)
Currently, the Make.com MCP tool (`t397_01_jab_sales_agent`) points to a lone webhook module. We need to build the logic inside Make.com to handle the agent's requests.
- [ ] **Build Make.com Router:** Create a routing step in the "Walter Jab Facebook Scenario" to handle different action types passed by the agent (e.g., `action: "book_workshop"`, `action: "schedule_followup"`).
- [ ] **Google Calendar Integration:** Wire the Make.com scenario to automatically add registered leads to the Free 90-min AI Workshop events.
- [ ] **CRM Sync:** Ensure any bookings made via the agent are synced to the Airtable `Registrations` or `Participants` tables via Make.com (or verify the MCP handles it completely).

### Phase 7: Real-World Testing & Facebook Ad Flow
- [ ] **Live Channel Testing:** Send a real SMS to the TextLink number and a real message to the connected Facebook Page to verify the API keys and Page Access Tokens.
- [ ] **Facebook Ad Flow Integration:** Set up a "Click-to-Messenger" ad. Pre-populate the user's initial message (e.g., *"I'm interested in AI automation"*) so the Agent has immediate context to pitch EdgeMax AI Core.
- [ ] **Lead Ads (Optional):** If using Instant Forms, build a specific `leadgen` webhook to ingest forms and trigger the first automated outbound message.

### Phase 8: Hardening, Analytics & Dashboard Completion
- [ ] **Dashboard Timeline View:** Update the Next.js Control Room to show the unified `Conversation Messages` timeline directly in the UI (currently it fetches history on demand).
- [ ] **Compliance & Rate Limits:** Implement strict DNC (Do Not Call/Text) handling for "STOP" keywords and enforce quiet hours (e.g., no automated SMS between 8 PM and 8 AM).
- [ ] **Analytics:** Add simple conversion tracking to the dashboard (e.g., Capture Rate, Workshop Booking Rate, Edge Core Close Rate).

---

## Agent Operational Reminders
- **Always Consult the Brain First:** Use `notebook_query` with Notebook ID `09144c95-f326-4d4f-b914-fc2b36455b08` for objection handling and product knowledge.
- **Log Everything:** Every outbound message MUST be logged via `append_conversation_message` to maintain the unified Airtable transcript.
- **Handoff Priority:** Any lead marked `handoff_requested: true` takes precedence in the Human Action Queue.
# JAB Cloud-First Customer Engagement + Sales OS: Implementation Plan v6

> **🛑 HOW TO RESUME IN YOUR NEXT SESSION**
> 1. Provide the agent with this exact prompt: *"We are resuming work on the JAB Sales Agent. Please read `theplan6.md` to get caught up."*

This document serves as the active blueprint for the autonomous execution of the JAB Cloud-First Customer Engagement + Sales OS. It reflects the successful deployment of the Make.com routing logic, live Messenger end-to-end testing, memory integration, and Stripe checkout automation.

## 1. Where We Are (Accomplishments)

### Phase 6: Make.com Integration & Automation Routing (COMPLETED)
- **Make.com Custom Webhook & Router:** Built a robust routing step in Make.com that securely receives structured actions (`book_workshop`, `add_follow_up_task`) from the `jab-cloud-gateway`.
- **Google Calendar Integration:** The Make.com scenario automatically adds registered leads to the Free 90-min AI Workshop events when triggered by the agent.
- **CRM Sync:** Workshop bookings and Follow-Up Tasks are now reliably synced to their respective Airtable (`Participants` and `Follow-Up Tasks`) tables.

### Phase 7: Real-World Testing & Facebook Ad Flow (PARTIALLY COMPLETED)
- **Live Messenger Testing (COMPLETED):**
  - Successfully connected the live Facebook Page to the Cloud Run gateway.
  - Implemented Idempotency and Background processing to eliminate duplicate webhook triggers from Facebook.
  - Successfully resolved Agent Memory issues by optimizing Airtable Linked Record queries in `get_conversation_context`. The Agent now perfectly remembers user details and context across messages.
  - Successfully resolved Stripe Checkout validation errors (handling missing emails properly) and enforced strict Sales Stage updating logic.
  - The End-to-End flow (Greeting -> Capturing Info -> Generating $199 EdgeMax AI Core Stripe Link) is verified and live.
- **Live SMS Testing (NEXT):** Need to verify live SMS flows via TextLink API.
- **Facebook Ad Flow Integration (NEXT):** Set up a "Click-to-Messenger" ad. Pre-populate the user's initial message.
- **Lead Ads (Optional):** If using Instant Forms, build a specific `leadgen` webhook.

---

## 2. Where We Are Going (Next Steps)

### Phase 7.1: Finalizing Channel Tests (NEXT)
- [ ] **Live SMS Testing:** Send a real SMS to the TextLink number to ensure the gateway creates leads via phone number and responds correctly.
- [ ] **Click-to-Messenger Ad Setup:** Define the exact entry payload/greeting for Ad traffic so the Agent knows to immediately pitch EdgeMax AI Core.

### Phase 8: Hardening, Analytics & Dashboard Completion
- [ ] **Dashboard Timeline View:** Update the Next.js Control Room to show the unified `Conversation Messages` timeline directly in the UI (currently it fetches history on demand).
- [ ] **Compliance & Rate Limits:** Implement strict DNC (Do Not Call/Text) handling for "STOP" keywords and enforce quiet hours (e.g., no automated SMS between 8 PM and 8 AM).
- [ ] **Analytics:** Add simple conversion tracking to the dashboard (e.g., Capture Rate, Workshop Booking Rate, Edge Core Close Rate).

---

## Agent Operational Reminders
- **Always Consult the Brain First:** Use `notebook_query` with Notebook ID `09144c95-f326-4d4f-b914-fc2b36455b08` for objection handling and product knowledge.
- **Log Everything:** Every outbound message MUST be logged via `append_conversation_message` to maintain the unified Airtable transcript.
- **Handoff Priority:** Any lead marked `handoff_requested: true` takes precedence in the Human Action Queue.
- **Sales Stages:** Only use exact Airtable stages: `"Capture"`, `"Qualify"`, `"Educate"`, `"Objection"`, `"Close"`, `"Onboarding"`.
- **Memory:** The `get_conversation_context` tool is critical; ensure the agent relies on it to avoid re-asking for information already provided.

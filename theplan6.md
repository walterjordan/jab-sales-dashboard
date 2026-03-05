# JAB Cloud-First Customer Engagement + Sales OS: Implementation Plan v6

> **🛑 HOW TO RESUME IN YOUR NEXT SESSION**
> 1. Provide the agent with this exact prompt: *"We are resuming work on the JAB Sales Agent. Please read `theplan6.md` to get caught up."*

This document serves as the active blueprint for the autonomous execution of the JAB Cloud-First Customer Engagement + Sales OS. It reflects the successful deployment of the Make.com routing logic, live Messenger end-to-end testing, memory integration, Stripe checkout automation, and the new architecture for automated lead generation.

## 1. Where We Are (Accomplishments)

### Phase 6: Make.com Integration & Automation Routing (COMPLETED)
- **Make.com Custom Webhook & Router:** Built a robust routing step in Make.com that securely receives structured actions (`book_workshop`, `add_follow_up_task`) from the `jab-cloud-gateway`.
- **Google Calendar Integration:** The Make.com scenario automatically adds registered leads to the Free 90-min AI Workshop events when triggered by the agent.
- **CRM Sync:** Workshop bookings and Follow-Up Tasks are now reliably synced to their respective Airtable (`Participants` and `Follow-Up Tasks`) tables.

### Phase 7: Real-World Testing & Integration Fixes (COMPLETED)
- **Live Messenger Testing (COMPLETED):**
  - Successfully connected the live Facebook Page to the Cloud Run gateway.
  - Implemented Idempotency and Background processing to eliminate duplicate webhook triggers from Facebook.
- **Live SMS Testing & Integration (COMPLETED):**
  - Successfully resolved TextLink Webhook 401 Unauthorized errors by properly implementing and validating webhook secrets.
  - Hardcoded `sim_card_id` injection into custom Axios request for TextLink API because the official library lacks support for routing to specific device plans.
  - Successfully tested SMS End-to-End flow: Gateway lead creation -> Agent triggering -> Live Stripe link generation via SMS.
- **NotebookLM Brain Authentication (COMPLETED):**
  - Resolved `HTTP 401/429` expiration and rate-limiting issues by regenerating fresh browser cookies via `nlm login` and deploying to a dedicated cloud MCP instance.
  - Confirmed the Sales Agent successfully pulls live product inclusion data (EdgeMax AI CORE) directly from the notebook via SMS queries.
- **Workshop Fallback System (COMPLETED):**
  - Successfully tested the objection-handling pathway. Agent correctly abandoned the Stripe close, retrieved live Workshop dates from Airtable, captured missing email data, and executed the `book_workshop` tool.

---

## 2. Where We Are Going (Next Steps)

### Phase 8: Sales Control Room & Campaign Manager (CURRENT)
The `jab-cloud-gateway` Next.js frontend will become the central "Control Room" for the entire OS, acting as both an analytics viewer and a campaign launcher.
- [x] **Scaffold Next.js App Route Structure:** Implemented fixed Sidebar navigation, Layout shell, and integrated Lucide icons.
- [x] **Dashboard Home (Overview):** Built high-level metrics pulling from Airtable (Total Leads, High Intent, Tasks, Revenue).
- [x] **Unified Inbox View:** Implemented a real-time message stream viewer in `/inbox` that correctly distinguishes between SMS and Messenger channels and displays chronological history per lead.
- [x] **Lead Management Table:** Implemented the initial `/leads` page displaying all active prospects from Airtable.
- [ ] **Campaign Launcher:** UI to start a new day by reviewing who to follow up with, what emails/texts will be sent out, and viewing responses from the previous day.

### Phase 9: Automated Outbound Lead Generation & Enrichment (NEW)
We are building a completely automated system that researches leads and communicates digitally end-to-end.
- [ ] **Business Discovery (Google Places API):** Build an internal Next.js API route that accepts a query (e.g., "roofing contractor atlanta") and uses the Google Places API to fetch business names, websites, and phone numbers.
- [ ] **Email Enrichment (Hunter.io / Apollo.io):** Take the domains discovered by Google Places and programmatically pass them to an enrichment API (like Hunter or Apollo) to find verified business email addresses.
- [ ] **Database Ingestion:** Automatically store these enriched profiles into the Airtable `Leads` table tagged as "Cold Leads".
- [ ] **Email Infrastructure Integration:** Integrate an Email API (e.g., Resend, SendGrid) to send outbound emails and set up an inbound email webhook to route replies back into our `handleCanonicalEvent` flow, allowing the AI to auto-respond to emails just like it does for SMS/Messenger.
- [ ] **Human-in-the-Loop:** If the AI determines a human is needed to close a high-value prospect, it will use the `request_handoff` tool, which will be configured to send a direct SMS alert to Walter (770-313-2589).

---

## Agent Operational Reminders
- **Always Consult the Brain First:** Use `notebook_query` with Notebook ID `09144c95-f326-4d4f-b914-fc2b36455b08` for objection handling and product knowledge.
- **Log Everything:** Every outbound message MUST be logged via `append_conversation_message` to maintain the unified Airtable transcript.
- **Handoff Priority:** Any lead marked `handoff_requested: true` takes precedence in the Human Action Queue.
- **Sales Stages:** Only use exact Airtable stages: `"Capture"`, `"Qualify"`, `"Educate"`, `"Objection"`, `"Close"`, `"Onboarding"`.
- **Memory:** The `get_conversation_context` tool is critical; ensure the agent relies on it to avoid re-asking for information already provided.

# theplan.md — JAB Cloud-First Customer Engagement + Sales OS (Edge Core Close Engine)

This plan defines a **cloud-first** end-to-end customer engagement system that automates **sales, marketing, operations, customer service, and billing**—optimized to **close EdgeMax AI Core (“Edge Core”)** as the default outcome.

Key changes from prior drafts:
- **No public tunnel / no local public webhooks.** All inbound webhooks live in cloud services.
- **Stripe is integrated** for invoices, payments, deposits, and billing automation.
- The sales flow always attempts to **close Edge Core**, otherwise:
  - **create a follow-up task in the DB**, or
  - **offer a free AI workshop** (general) or a **free dedicated workshop** (owners/staff upskill),
  - and **auto-book** into the existing events structure.
- Cloud services interact with **OpenAI Agent Builder** via **custom MCP connections** (same pattern as your previous setup).
- Instructions for Gemini explicitly avoid “hamster wheel” loops: if Gemini needs something only you can do (another app/console), it must tell you. If there’s a better connection/tooling option, it must suggest it.

---

## 0) System Outcomes

### Primary outcome (always)
**Close Edge Core**:
- Present Edge Core as the default solution package.
- Ask for purchase/checkout when intent threshold is met.
- If high intent: move directly to payment + onboarding.

### Secondary outcomes (if “somewhat interested”)
If the lead is not ready to buy:
1) **Create a DB follow-up task** (date/time + reason + next message).
2) Offer either:
   - **Free AI Workshop (general)**, or
   - **Free Dedicated Workshop** (business owners or staff upskill).
3) **Auto-book** the selected workshop into the **existing events structure**, then confirm via customer’s preferred channel.

---

## 1) Cloud-First Architecture (No Local Webhooks)

### 1.1 What runs in the cloud (public, always-on)
**Webhook Gateway / Event Ingest**
- Receives public webhooks:
  - Meta/Messenger inbound events
  - TextLink inbound + sent + failed + tag changes
  - Stripe events (payment succeeded, invoice paid, checkout completed, etc.)
- Validates signatures/secrets
- Normalizes into **canonical events**
- Writes to a shared **DB + queue**
- Invokes **OpenAI Agent Builder** using **custom MCP tools** (callable endpoints)

**Tool/MCP Services Hosting**
- Host MCP tool servers (or HTTP tool endpoints) in cloud so Agent Builder can call them:
  - NotebookLM MCP (Jab Sales Notebook)
  - DB/CRM MCP
  - Messaging MCP (Messenger send, TextLink send)
  - Booking MCP (existing events structure)
  - Stripe MCP (create checkout, invoice, lookups)

**CI/CD**
- GitHub push triggers cloud build & deploy (gateway + tool services).

### 1.2 What runs locally (dev-only)
- Code changes, tests, fixtures, event replay scripts
- Push to GitHub → triggers cloud deploy
- No public endpoints required locally.

---

## 2) Core Components

### 2.1 Canonical Event Schema
Define a shared schema used by all channels:

- `message.inbound`
- `message.outbound.requested`
- `message.outbound.sent`
- `message.outbound.failed`
- `lead.captured`
- `preference.updated`
- `stage.updated`
- `score.updated`
- `handoff.requested`
- `handoff.completed`
- `booking.requested`
- `booking.confirmed`
- `workshop.offered`
- `workshop.booked`
- `checkout.created`
- `checkout.completed`
- `invoice.sent`
- `invoice.paid`
- `payment.failed`
- `support.ticket.created`

### 2.2 Identity & State Store (DB)
Unify identity across channels:
- Messenger PSID
- phone (E.164)
- email
- internal contact_id

State must include:
- stage, score, tag
- preferred_channel
- last touch timestamps
- offer path: `EDGE_CORE` | `WORKSHOP_GENERAL` | `WORKSHOP_DEDICATED` | `FOLLOW_UP_ONLY`

### 2.3 Conversation Router (Agent Orchestrator)
For each inbound event:
1. Load contact + conversation state
2. Decide next best action:
   - Close Edge Core (preferred)
   - Or offer workshop
   - Or schedule follow-up
3. If needed, call:
   - NotebookLM brain for grounded answers + messaging
   - Stripe tool for payment link/invoice
   - Booking tool for event booking
   - Messaging tools to deliver response in preferred channel

---

## 3) The Brain: Jab Sales Notebook (NotebookLM via MCP)

NotebookLM is the “sales brain” for:
- Edge Core positioning, FAQs, proof, objections
- Workshop content framing and qualification
- Operations/support answers (as you add SOP sources)

**Notebook to connect:**
https://notebooklm.google.com/notebook/09144c95-f326-4d4f-b914-fc2b36455b08

Requirement:
- Build a custom MCP connection so Agent Builder can:
  - query/summarize
  - retrieve citations/snippets
  - expand sources (when supported)

---

## 4) Sales Flow (Edge Core Close Engine)

### 4.1 Stages (sales)
1) Capture / Intake
2) Qualification (Pre-closer)
3) Education / Authority
4) Objection Handling
5) Close (Edge Core)
6) Payment (Stripe)
7) Onboarding

### 4.2 “Always close Edge Core” rules
At each turn, Router checks:
- Are they qualified enough to present Edge Core?
- If yes: present Edge Core + ask for next step (checkout or booking).
- If objections: handle and re-ask.

### 4.3 If “somewhat interested” (not ready now)
Trigger fallback package:
- Create DB follow-up task (with date/time + message template)
- Offer workshops:
  - Free AI Workshop (general)
  - Free Dedicated Workshop (owner/staff upskill)
- If they accept: auto-book into existing event structure and confirm.

---

## 5) Booking Automation (Existing Events Structure)

### 5.1 Requirement
Automation must **use the existing events structure** (current booking calendars/events you already have).

The Booking MCP tool must support:
- list availability (or list events)
- create booking (workshop or call)
- reschedule/cancel (optional)
- attach contact metadata + notes

### 5.2 Booking types
- `edge_core_strategy_call`
- `workshop_general`
- `workshop_dedicated_owner`
- `workshop_dedicated_staff`

### 5.3 Booking triggers
- `workshop.offered` → `booking.requested` → `workshop.booked`
- If lead goes “Hot”: `booking.requested` for call (optional) or go straight to Stripe.

---

## 6) Stripe Integration (Mandatory)

### 6.1 What Stripe must do
- Create a **Checkout Session** (preferred for simplicity)
- Optionally send invoices (if you use invoicing)
- Track payments, failures, refunds
- Write outcomes back to DB and trigger onboarding

### 6.2 Stripe event handling (webhooks → canonical events)
Stripe webhooks in Cloud Gateway normalize to:
- `checkout.completed`
- `invoice.paid`
- `payment.failed`

### 6.3 What happens after payment
- Tag contact as `Client`
- Stage → `Onboarding`
- Auto-send onboarding checklist and/or book kickoff event (existing structure)

---

## 7) Multi-Channel Preference & Handoff

### 7.1 Preference-first
- If customer prefers SMS, the system continues via SMS.
- If they start in Messenger but request “text me”, capture phone + consent and handoff.

### 7.2 TextLink required behaviors
- Store all SMS in unified transcript
- Correlate failures via `custom_id`
- Update tags (Cold/Warm/Hot/DNC)

---

## 8) Data Model (MVP)

### 8.1 Contact
- contact_id
- name
- phone_e164
- email
- messenger_psid
- preferred_channel
- stage
- lead_score
- tag
- offer_path
- created_at/updated_at

### 8.2 FollowUpTask
- task_id
- contact_id
- due_at
- reason
- next_message_template
- status (open/done)

### 8.3 Booking
- booking_id
- contact_id
- booking_type
- start_time/end_time
- status
- external_event_id (existing events structure)

### 8.4 Payment
- payment_id
- contact_id
- stripe_customer_id
- stripe_checkout_session_id
- status
- amount
- created_at

---

## 9) Implementation Phases

### Phase 1 — Cloud gateway + canonical events + DB (COMPLETED)
- [x] Build Cloud Webhook Gateway (public endpoints)
- [x] Normalize events + store in DB/queue
- [x] Add event replay scripts locally

### Phase 2 — Core MCP Tool Surfaces (COMPLETED)
- [x] Host custom MCP tools in cloud (jab-sales-tools-mcp deployed to Cloud Run).
- [x] Integrate Stripe Checkout generation.
- [x] Integrate Airtable DB updates (leads, tasks, stages).
- [x] Set up IAM for secure service-to-service calls.

### Phase 3 — The Human-in-the-Loop Dashboard (NEXT)
- [ ] Build a "Sales Control Room" Dashboard (Next.js).
- [ ] Surface Airtable data (leads, stages, scores) in a clean UI.
- [ ] Provide manual overrides/triggers (e.g., "approve follow-up", "start outreach").
- [ ] Monitor active Agent status and Stripe checkout statuses.

### Phase 4 — Multi-Agent System Setup (OpenAI)
- [x] Create specialized Agents in OpenAI (e.g., Lead Qualifier, Closer, Outreach).
  * **Primary Agent Workflow ID:** `wf_69a50ac49b508190b3ce3b18cc53bf3a005730f2ca310da5` (version 1)
- [x] Wire Agents to cloud-hosted MCP tools (`jab-sales-tools-mcp` via SSE).
- [ ] Connect NotebookLM brain MCP and Make.com MCP.
- [ ] Implement qualification → objection → close scripts using NotebookLM context.

### Phase 5 — Fallback & Booking Automation
- [ ] If “somewhat interested”:
  - create follow-up tasks in DB
  - offer workshops
  - auto-book in existing events structure

### Phase 6 — Hardening + analytics
- retries, rate limits, DNC compliance
- dashboards: conversion, bookings, payment success

---

## 10) Definition of Done (Acceptance Tests)

1) Messenger inbound → Router → closes Edge Core (creates Stripe checkout) → payment succeeds → onboarding triggered
2) Messenger inbound → user requests SMS → phone captured + consent → TextLink SMS continues with same context
3) “Somewhat interested” → follow-up task created in DB → workshop offered → booking auto-created → confirmations sent
4) Stripe webhook → DB updated → client tagged → onboarding message sent
5) TextLink failed webhook → retry/fallback + logs correlated via `custom_id`
6) GitHub push → cloud build deploys gateway + MCP tools successfully

---

# 11) Gemini 3 CLI Prompt (Clear, No Hamster Wheel)

Paste this as your main prompt to Gemini 3. It’s explicit about:
- cloud-first webhooks,
- Stripe,
- Edge Core close engine,
- workshop fallback with auto-booking,
- and how Gemini should ask you for manual steps only when required.

```text
You are Gemini 3 operating in my local repo (jab-sales-automation). Your job is to design and implement an end-to-end, cloud-first customer engagement system that automates sales, marketing, operations, support, and billing.

NON-NEGOTIABLE REQUIREMENTS
1) NO PUBLIC TUNNEL / NO local public webhooks. All inbound webhooks must be handled by a cloud Webhook Gateway service that is publicly reachable.
2) Cloud services must interact with OpenAI Agent Builder using custom MCP connections (same pattern as our previous project). Host MCP tool services in cloud so Agent Builder can call them.
3) Stripe must be integrated:
   - create checkout sessions/invoices
   - process webhooks
   - update DB state and trigger onboarding
4) Sales flow must ALWAYS attempt to close EdgeMax AI Core (“Edge Core”).
   - When intent is sufficient: present Edge Core and ask for checkout.
   - If objections: handle them and re-ask.
5) If the lead is somewhat interested but not ready:
   - create a follow-up task in the DB (due date/time + reason + next message template)
   - offer a free AI workshop OR a free dedicated workshop (owners/staff upskill)
   - if accepted: auto-book into the existing events structure (do not invent a new booking system)
6) The brain for all customer interactions is NotebookLM via MCP using this notebook:
   https://notebooklm.google.com/notebook/09144c95-f326-4d4f-b914-fc2b36455b08
   Implement the MCP connection using MCP documentation in this repo, and make it the default for this Sales Agent project.

ANTI-HAMSTER-WHEEL INSTRUCTIONS (IMPORTANT)
- Do not ask me repeated generic questions.
- If you need something ONLY I can do in another app/console (e.g., create a Stripe webhook endpoint, set a Meta webhook, grant permissions, create a key), tell me exactly what to do with a short checklist.
- If there is a way for YOU to perform an action via an available connection/tool (MCP, CLI, config in repo), do that instead of asking me.
- If a better connection option exists (e.g., a more direct MCP tool, official provider integration, or existing repo module), propose it.

WHAT TO DELIVER
A) Repo audit
   - Identify existing code for jab-site, jab-fb-messenger, MCP configs, booking/events code, and any previous NotebookLM integration.
B) Architecture
   - Cloud Webhook Gateway (public endpoints) → canonical events → DB/queue → Agent Builder calls MCP tools.
   - Define canonical event schemas, data model, and router behavior.
C) Implement cloud gateway
   - Choose Cloudflare Workers by default unless repo indicates AWS/GCP already.
   - Implement endpoints for Meta, TextLink, Stripe; validate secrets/signatures.
   - Normalize and persist events.
D) Implement MCP tool services (cloud-hosted)
   - NotebookLM MCP connection to Jab Sales Notebook (default brain).
   - DB/CRM MCP (contacts, tasks, bookings, payments).
   - Messaging MCPs (Messenger send, TextLink send).
   - Booking MCP that uses the existing events structure.
   - Stripe MCP (create checkout, lookups).
E) Implement sales flow logic
   - Edge Core close engine.
   - Fallback: follow-up task + workshop offer + auto-book.
F) Update documentation
   - Create/update a single plan file at repo root called theplan.md capturing everything:
     architecture, modules, event types, data model, flows, setup, CI/CD, acceptance tests.
G) Commit and push-ready
   - Make code changes with clear commits.

START NOW:
1) Audit the repo and report findings.
2) Propose target folder structure and services.
3) Begin implementing cloud gateway + MCP tool surfaces.
4) Create/update theplan.md continuously as a changelog + blueprint.
```

---

## 12) Immediate Next Step For You

1) Paste the Gemini prompt above.  
2) When Gemini identifies any **manual-only actions** (Stripe webhook setup, Meta app webhook, TextLink webhook URLs), it should output a short checklist for you.  
3) Everything else should be implemented by Gemini directly in the repo.

--- 
Here is a summary of how the creator built an autonomous AI website design agency using Perplexity's new "Computer" tool, which you can use as a blueprint for your own project:

**Step 1: Strategy and Blueprint Generation**
The creator started by prompting Perplexity (on the Max Plan) with the core idea of an autonomous web design agency. Perplexity autonomously researched cold email best practices and AI automation tools to generate a PDF blueprint outlining a **multi-agent architecture**. This architecture included:
*   **Lead Finder Agent:** Instructed to target high-value US service niches like plumbing, roofing, and auto detailing.
*   **Web Design Agent:** Tasked with creating website redesign previews for the prospects.
*   **Outreach Agent:** Responsible for cold email campaigns.
*   **Sales Closer Agent:** Manages the CRM pipeline (via Airtable), client communication (via WhatsApp), and payments (via Stripe) using tiered pricing ($49, $99, and $199).

**Step 2: Automated Lead Generation and Web Design**
Once the plan was set, the AI worked autonomously for about 20 minutes to execute the first batch of leads. 
*   It found 10 businesses and used **Gemini Flash** to screenshot and analyze their current websites.
*   It extracted the actual business content (like services and testimonials) and used **Claude Opus 4.6** to build a modern, fully redesigned website preview.
*   Without being explicitly asked, the AI generated highly persuasive **"before and after" comparison screenshots** to use in the outreach materials.

**Step 3: Drafting the Outreach Sequence**
The AI drafted highly personalized cold emails that pointed out specific flaws in the leads' current websites (e.g., insecure connections or cluttered layouts). The email offered a "sneak peek" of the redesigned site, blurring the full design and asking the prospect to reply "yes" to see the full version. It also autonomously generated a 3-day follow-up sequence and a final "breakup" email.

**Step 4: Establishing Legitimacy**
Before launching the campaign, the creator asked Perplexity to quickly spin up a basic landing page to link in their email signature. This provided a professional front, explaining the agency's risk-free value proposition: "We redesign your website for free... You only pay if you love it".

**Step 5: Infrastructure Integration and Launch**
For the final step, the entire system was integrated with an email infrastructure tool called **Instantly** via API. The AI automatically populated the campaign with the first 10 leads, attached the customized previews, and connected to a Gmail account to monitor for replies, making the entire pipeline ready to run autonomously.

**End of plan.**

Even thhough this is the end of the plan does not mean that you can not create ideas that enhance the automation processes. The idea is to be a self driving machine using the tech stack provided as a core however if there are other api, mcp or resources that will help accomplish the task then first educate me on how they fit and then guide me through thier installation if needed but alway reseacrch for mcp connections. Do not assume connections work. first validate them and keep all generated scripts in a directory for possible reuse. These and other appropiated items should be iteratively updated. put in limits for scope creep. Remember that once the noteboook lm mcp connection is established that it is to be used to store sources that support the entire sales process. Also at your disposal is co pilot however i am on a free plan so it should be used if needed, for example the jab-site and aimastermind are on github and thier are actions on jab-site that watch for new events on the jab gmail calendar to fire make.com triggers. all of this is documented if you carefully review the resources before you act always give me the plan and put that in gemin.md.
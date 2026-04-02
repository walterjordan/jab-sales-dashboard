# JAB Sales Automation OS: Comprehensive System Overview

## 1. Mission & Core Objective
The **JAB Cloud-First Customer Engagement + Sales OS** is a fully autonomous "Self-Driving Machine" designed to handle the entire lifecycle of a lead—from discovery and enrichment to qualification, outreach, and closing.

- **Primary Outcome:** Close **EdgeMax AI Core ($199)** via Stripe checkout.
- **Secondary Outcome:** If not ready to buy, auto-book into a **Free AI Workshop** and create a DB follow-up task.
- **Philosophy:** Cloud-first architecture, no local tunnels, unified canonical events, and AI-driven decision-making.

---

## 2. System Architecture (Cloud-First)

### 2.1 Webhook Gateway & Event Ingest
A public-facing gateway (Cloud Run / Cloudflare) that receives and normalizes webhooks from:
- **Meta (Facebook Messenger):** Inbound customer messages.
- **TextLink:** Inbound SMS, delivery confirmations, and status changes.
- **Stripe:** Payment success, checkout completions, and invoice status.

### 2.2 Canonical Event Schema
All inbound data is normalized into a shared event language:
- `message.inbound` / `message.outbound.sent`
- `lead.captured`
- `booking.requested` / `booking.confirmed`
- `checkout.created` / `checkout.completed`
- `score.updated` / `stage.updated`

### 2.3 The "Central Brain" (NotebookLM)
- **Source of Truth:** The system uses a dedicated **Jab Sales Notebook** (via Custom MCP) containing all JAB-specific knowledge, pricing, objection handling, and service details.
- **Capabilities:** Query-based retrieval, summarization, and citation-backed answering for sales agents.

---

## 3. Database & CRM (Airtable)
Airtable serves as the single source of truth for all relational data.
- **Leads:** Master record with intelligence fields (`Line Type`, `Carrier`, `Hunter Enriched`, `Tags`).
- **Conversations:** Unified transcript of SMS, Messenger, and Web Chat messages.
- **Phones & Emails:** Granular tracking of contact points and their eligibility.
- **Outreach Attempts:** Audit log of every message sent, including channel used and provider IDs.
- **Follow-up Tasks:** Scheduled AI-reminders for "Somewhat Interested" leads.

---

## 4. Smart Outreach Engine (v1.1 Implementation)

### 4.1 Phone & Email Intelligence
- **Twilio Lookup v2:** Every phone number is scanned for "Line Type Intelligence."
  - **Mobile:** Eligible for SMS.
  - **Landline/VoIP:** Blocked for SMS to protect deliverability; routed to Email or Call.
- **Hunter.io:** Automatically finds and verifies professional email addresses and company data.

### 4.2 Channel-Aware Routing
The system dynamically chooses the best outreach channel based on lead data:
- **Default:** SMS (if mobile).
- **Fallback:** Personalized AI Email (if landline + email available).
- **Manual:** Call Follow-up (if only landline available).

### 4.3 Communication Infrastructure
- **TextLink API:** Handles all SMS delivery.
- **Gmail API (OAuth2):** Sends personalized outreach and attachments from `support@jordanborden.com`.
- **Real-Time Alerts:** Inbound messages trigger an immediate SMS alert to JAB staff for human-in-the-loop intervention.

---

## 5. Sales Flow & Automation Logic

### 5.1 The Close Engine
1. **Intake:** Lead captured via Messenger or SMS.
2. **Qualification:** AI Agent (OpenAI Builder) qualifies intent.
3. **Closing:** If intent is high, AI generates a **Stripe Checkout Link** for Edge Core.
4. **Onboarding:** Payment success triggers automated onboarding tags and messages.

### 5.2 The Fallback Path ("Somewhat Interested")
If a lead is hesitant:
1. **Workshop Offer:** AI offers a 90-min Free AI Workshop.
2. **Auto-Booking:** AI checks existing event structures (via Make.com/Airtable) and registers the lead.
3. **Follow-up:** A task is created in Airtable for a future touchpoint.

---

## 6. Full Asset & API Access (Tooling Portfolio)
The system currently has active connections and tool-definitions for:

- **Airtable API:** Full CRUD on Leads, Tasks, Conversations, and Bookings.
- **Stripe API:** Create checkouts, list products, track payments.
- **Twilio Lookup API:** Line Type and Carrier intelligence.
- **Hunter.io API:** Domain search, email finder, and verification.
- **Gmail API:** Send/Receive (inbound pending) from corporate workspace.
- **TextLink API:** SMS sending and device management.
- **NotebookLM MCP:** High-context semantic search of the JAB sales brain.
- **Make.com MCP:** Triggering complex existing workflows and calendar events.
- **Media Assets:**
  - `AIMastermind.png`: General AI Workshop promotion.
  - `ATLAIMastermind.png`: Location-specific (Atlanta Metro) promotion.
  - `JAB Digital Flyer EMAIL.jpg`: Comprehensive digital service overview.

---

## 7. Planned Upgrades (v1.2+)

### 7.1 Inbound Email Synchronization
Currently, outbound emails are logged, but replies stay in Gmail. v1.2 will implement **Google Cloud Pub/Sub** or a **Make.com Watcher** to automatically ingest email replies into the Airtable `Conversations` table, allowing the AI to continue the thread.

### 7.2 Intelligence Backfill Cron
A scheduled **Google Cloud Scheduler** job to run `backfill-intelligence.js` nightly. This ensures manually imported leads are automatically enriched with Twilio and Hunter data without human triggers.

### 7.3 Dynamic Location-Based Attachments
Refinement of the Agent's instructions to use lead metadata (e.g., "City") to choose between `AIMastermind.png` and `ATLAIMastermind.png` automatically.

### 7.4 Multi-Agent Coordination
Implementation of specialized sub-agents:
- **The Scout:** Lead discovery and enrichment.
- **The Qualifier:** Initial outreach and intent scoring.
- **The Closer:** Handling objections and generating payment links.

---

## 8. Agent Operational Guidelines
- **Educate & Propose:** Propose enhancements before building.
- **Validate First:** Always run validation scripts (`automation-scripts/`) before assuming an API is live.
- **NotebookLM First:** Consult the brain before answering any business-specific question.
- **Canonical Only:** Never bypass the normalization gateway for inbound data.

---
*Document Version: 1.1.5*
*Date: April 2, 2026*

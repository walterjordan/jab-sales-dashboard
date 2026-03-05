# JAB Cloud-First Customer Engagement + Sales OS: Implementation Plan & Guidelines

This document serves as the active blueprint and operational guideline for the autonomous execution of the JAB Cloud-First Customer Engagement + Sales OS, as defined in `theplan2.md`.

## Core System Architecture & Outcomes
1. **Cloud-First Only**: No local public tunnel webhooks. All inbound webhooks (Meta, TextLink, Stripe) live in public cloud services and normalize to canonical events.
2. **Primary Objective (Edge Core Close)**: The default outcome of any flow is to position and close EdgeMax AI Core via Stripe checkout.
3. **Fallback & Automation**: If a lead is not ready, the system will auto-create DB follow-up tasks, offer free workshops, and auto-book into existing event structures.
4. **Central Brain (NotebookLM)**: The Jab Sales Notebook (accessed via custom MCP) is the single source of truth. It must be used to store sources that support the entire sales process.
5. **Multi-Agent Inspiration**: Modeled after successful autonomous agency setups (Lead Finder, Web Designer, Outreach, Closer).

## Agent Operational Guidelines (The "Self-Driving Machine" Rules)

To ensure robust implementation and prevent scope creep or broken integrations, the AI agent must adhere to the following loop:

1. **Educate & Propose**: If a new API, MCP, or resource can enhance the automation, first educate the user on how it fits into the core stack. Always research if an **MCP connection** exists first.
2. **Validate Before Assuming**: **NEVER assume an API or MCP connection works out of the box.** Always create a small validation script to test the connection.
3. **Retain Scripts**: Save all generated validation and setup scripts into an `automation-scripts` (or `ai-mastermind-scripts`) directory for future reuse and iterative updates.
4. **Enforce Scope Creep Limits**: Focus strictly on the current phase. Do not build out secondary features until the primary Edge Core Close and Cloud Gateway are validated.
5. **Leverage Existing Resources**: 
   - Utilize GitHub Copilot if needed (free plan limits apply).
   - Be aware of existing `jab-site` actions/code that watch the JAB Gmail calendar to fire `make.com` triggers (these are documented in the codebase).

## Implementation Roadmap (Iterative Phases)

### Phase 1: Foundation, Audit & Validation (COMPLETED)
- [x] Create/designate an `automation-scripts` directory for retaining validation tools.
- [x] Validate the local NotebookLM MCP connection (`NotebookLM-setup`).
- [x] Audit existing `make.com` webhooks and GitHub Actions related to the JAB calendar in `jab-site-src` and `jab-fb-messenger`.
- [x] Establish the schema for canonical events.

## Canonical Event Schema (Phase 1.1)
All inbound webhooks normalize to these shared event types:
- `message.inbound`: Any incoming text from Messenger or SMS.
- `message.outbound.requested`: System-generated response pending delivery.
- `message.outbound.sent`: Confirmation of delivery from provider.
- `message.outbound.failed`: Error during delivery (triggers retry/correlation).
- `lead.captured`: New user identified with minimal info (PSID/Phone).
- `preference.updated`: User channel preference (Messenger vs SMS) changed.
- `stage.updated`: Sales stage changed (Qualification -> Close -> Onboarding).
- `score.updated`: Lead intent score changed.
- `handoff.requested`: System or User requested channel switch.
- `booking.requested`: User started the booking flow.
- `booking.confirmed`: Event successfully added to JAB calendar via `make.com`.
- `workshop.offered`: Fallback workshop presented to "somewhat interested" lead.
- `workshop.booked`: Fallback workshop successfully scheduled.
- `checkout.created`: Stripe checkout session initiated for Edge Core.
- `checkout.completed`: Stripe payment successful (triggers Onboarding).
- `invoice.sent` / `invoice.paid`: Billing-specific events.
- `support.ticket.created`: Triage event for non-sales queries.

### Phase 2: DB Structure & Core Sales MCP (COMPLETED)
- [x] Define the shared database structure (Contacts, Conversations, Follow-up Tasks, Bookings) in Airtable.
- [x] Create and deploy the `jab-sales-tools-mcp` to Cloud Run (handles Stripe Checkouts and Airtable Lead/Task updates).
- [x] Configure IAM permissions for secure internal Cloud Run invocation.

### Phase 3: The Control Room (Dashboard) (NEXT)
- [ ] Build a Next.js "Sales Control Room" Dashboard (likely leveraging `jab-cloud-gateway` or a new app).
- [ ] Dashboard features: View Airtable summaries, human-in-the-loop approvals, active Agent status, and manual triggers for specific agent workflows.
- [ ] Ensure the dashboard provides visibility into the "somewhat interested" follow-up queues and Stripe payment statuses.

### Phase 4: Multi-Agent Builder Setup (OpenAI)
- [ ] Create specialized custom GPTs / Agents in OpenAI (e.g., Lead Qualifier, Closer, Follow-up).
- [ ] Connect the cloud-hosted MCP services (`jab-sales-tools-mcp`, Make.com MCP, NotebookLM MCP) to these Agents.
- [ ] Map the qualification -> objection -> close scripts using NotebookLM context.

### Phase 5: Fallback & Booking Automation
- [ ] Implement the "Somewhat Interested" logic.
- [ ] Create DB follow-up tasks.
- [ ] Automate workshop booking via the existing events structure (triggering `make.com` webhooks where applicable).

---
*Note: This file should be iteratively updated as the system evolves and specific milestones are achieved.*
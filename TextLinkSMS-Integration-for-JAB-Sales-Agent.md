# TextLinkSMS Integration Guide for the JAB AI Sales Agent

This doc explains how to plug **TextLink** (SMS send/receive + webhook events) into the **JAB AI Sales Agent** workflow so the agent can:
- send outbound SMS (follow-ups, reminders, nurture),
- receive inbound SMS (replies, opt-outs, booking confirmations),
- track message delivery/failures,
- update lead “tags” (Cold → Warm → Hot) and route accordingly.

> This is designed to fit the JAB multi-agent pipeline (capture → qualify → educate → objections → booking → follow-up) described in the current JAB Sales Agent iteration. fileciteturn0file0

---

## 1) Where TextLink Fits in the JAB Agent Pipeline

### A. Outbound touchpoints (agent-driven)
Use TextLink to send SMS at key moments:
- **Pre-closer / Qualification Agent**: “Quick Qs before we book you…”
- **Education / Authority Agent**: send case study link + short prompts
- **Objection Handling Agent**: “Totally fair — want option A or B?”
- **Booking Agent**: reminders + reschedule prompts
- **Proposal / Follow-up Agent**: “Recap + next step” sequences

### B. Inbound handling (reply-driven)
Inbound SMS should trigger your “Conversation Router”:
- route to the correct agent based on current stage + lead score,
- detect intent (book, ask price, objection, unsubscribe),
- update CRM state.

### C. Status + failure signals
TextLink can webhook you when a message is sent and when it fails (you’ll receive “sent”, then possibly “failed”). citeturn2view0  
Use this to:
- retry with backoff,
- swap to another channel (email/DM),
- alert an operator if it’s a high-intent lead.

---

## 2) Required Setup in TextLink

### A. Get API key + configure “API & Hooks”
TextLink API requests use:
- `Content-Type: application/json`
- `Authorization: Bearer API_KEY` citeturn1view1

### B. Configure Webhook URLs
TextLink supports **4 webhook types**: received messages, sent messages, failed messages, and contact tag changes. citeturn1view0

In the TextLink “API console” / “API & Hooks” area, set:
- Received messages endpoint
- Sent messages endpoint
- Failed messages endpoint
- Contact tag change endpoint citeturn1view0

### C. Set a Webhook Secret (recommended)
If you set a secret, TextLink includes it in each webhook JSON so you can verify the request is from TextLink. citeturn2view0

---

## 3) Sending SMS (Outbound)

### A. Phone number format
TextLink expects the recipient number with country prefix, e.g. `+11234567890`. citeturn1view1

### B. REST API request body
When sending an SMS, the JSON body supports:
- `phone_number` (required)
- `text` (required)
- `sim_card_id` (optional) — pick which SIM to send from
- `custom_id` (optional) — **your correlation id** returned in failure webhooks citeturn1view1

**Recommendation:** set `custom_id` = your internal message id (or conversation id) so failures can be reconciled automatically.

### C. Node.js example (official package)
```js
// npm install textlink-sms
const textlink = require("textlink-sms");

textlink.useKey(process.env.TEXTLINK_API_KEY);
textlink.sendSMS("+15551234567", "Hey! Quick question before we book you...");
```
TextLink’s docs show this `textlink-sms` helper package pattern. citeturn1view1

### D. Python example (official package)
```py
# pip install textlink
import textlink as tl

tl.useKey(os.environ["TEXTLINK_API_KEY"])
result = tl.sendSMS("+15551234567", "Hey! Quick question before we book you...")
print(result)
```
TextLink’s docs show this `textlink` helper package pattern. citeturn2view1

### E. Handling queued results
TextLink may return a “queued” success when senders are busy. citeturn2view1  
Treat this as “accepted” and wait for the **sent messages webhook** for a definitive dispatch event.

---

## 4) Webhooks (Inbound + Status + Tag Changes)

### A. General rules
- Webhooks are **HTTP POST** with a JSON body. citeturn2view0  
- If your endpoint doesn’t return HTTP 200, TextLink treats it as unsuccessful and emails you. citeturn2view0

### B. Example: Received message payload
```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "phone_number": "+381690156360",
  "text": "General Kenobi",
  "tag": "Cold",
  "name": "Aleksandar Spremo",
  "sim_card_id": 123
}
```
citeturn2view0

**How to use this in the agent:**
1. Find (or create) the conversation by `phone_number`.
2. Determine stage using stored pipeline state + tag.
3. Route the message to the appropriate agent (Qualification/Education/Objection/Booking).
4. Write the inbound message to your conversation log.

### C. Example: Sent message payload
```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "phone_number": "+381690156360",
  "text": "Hello there",
  "portal": true,
  "timestamp": 1748463114559,
  "sim_card_id": 123
}
```
citeturn2view0

Use this to:
- mark outbound as “dispatched”,
- increment touch counters,
- trigger “wait-for-reply” timers in your follow-up agent.

### D. Example: Failed message payload
```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "phone_number": "+381690156360",
  "text": "Hello there",
  "portal": true,
  "timestamp": 1748463114559,
  "textlink_id": 100123,
  "custom_id": "1234",
  "sim_card_id": 123
}
```
citeturn2view0

Use this to:
- map the failure to your internal message using `custom_id`,
- retry or switch channels,
- notify a human if lead score is high.

### E. Example: Contact tag change payload
```json
{
  "name": "Aleksandar Spremo",
  "phone_number": "+381690156360",
  "tag": "Warm",
  "subuser_id": 6
}
```
citeturn2view0

Use this to:
- update CRM tag (Cold/Warm/Hot),
- re-route the lead (e.g., Warm → push booking CTA; Hot → immediate strategy call offer).

---

## 5) “Contact Tag” Strategy (Cold → Warm → Hot)

TextLink supports updating contact tags via API, and tag changes can trigger webhooks. citeturn2view1

**Suggested tag mapping for JAB:**
- **Cold**: new lead, unqualified
- **Warm**: qualified + engaged (replied, clicked, answered budget)
- **Hot**: booked call OR asked to start / asked price seriously
- **Do Not Contact**: opt-out / “stop”

**Update triggers (examples):**
- Cold → Warm:
  - replied with business details,
  - answered budget/timeline,
  - clicked case study link.
- Warm → Hot:
  - requested booking,
  - confirmed time,
  - asked about onboarding/payment.

---

## 6) Recommended Data Model (Minimal)

Store these entities in Airtable/DB/CRM:

### Lead / Contact
- `phone_number` (E.164 w/ + prefix)
- `name`
- `tag` (Cold/Warm/Hot/DNC)
- `lead_score`
- `stage` (Qualification/Education/Objection/Booking/Proposal)
- `last_inbound_at`, `last_outbound_at`

### Message
- `message_id` (internal)
- `phone_number`
- `direction` (inbound/outbound)
- `text`
- `status` (queued/sent/failed)
- `custom_id` (set = message_id or conversation_id)
- `textlink_id` (from failure webhook)
- `timestamp`

---

## 7) Implementation Patterns

### A. Conversation Router (webhook entrypoint)
Create one internal “router” service that:
1. validates webhook secret (if used),
2. normalizes payload into your internal schema,
3. writes to storage,
4. triggers the correct agent.

### B. State machine
Maintain a small state machine per lead:
- inbound keywords/intent → state transitions,
- score updates,
- next best action selection.

### C. Rate-limiting + compliance
- throttle outbound to avoid carrier issues.
- respect opt-out keywords (“STOP”, “unsubscribe”) by setting tag = DNC immediately.

---

## 8) No-Code Option (Make.com / Zapier)

TextLink explicitly supports using webhooks to trigger no-code workflows and calling API endpoints from Make via an HTTP module. citeturn0search3turn2view0

**Fastest build path:**
- TextLink “Received messages webhook” → Make webhook trigger
- Make routes based on tag/stage → calls your agent endpoint (or OpenAI workflow)
- Make “HTTP: Make a request” → TextLink send SMS endpoint with `Authorization: Bearer API_KEY` citeturn0search3

---

## 9) Quick Checklist

- [ ] Create TextLink account + device setup (SIM + Android)
- [ ] Get API key (API & Hooks)
- [ ] Add 4 webhook URLs (received/sent/failed/tag change)
- [ ] Generate and store webhook secret; validate it on every webhook
- [ ] Implement Conversation Router + storage
- [ ] Implement outbound send with `custom_id` correlation
- [ ] Add tag strategy (Cold/Warm/Hot/DNC) and scoring hooks
- [ ] Add retries + channel fallback for failures
- [ ] Test end-to-end using “Test webhooks” in TextLink citeturn2view0

---

## Appendix: Useful TextLink Docs Sections
- API (send SMS + OTP + tags) citeturn1view1
- Webhooks (received/sent/failed/tag change + secret verification) citeturn1view0
- Make.com integration notes citeturn0search3

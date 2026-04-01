````md
# JAB Sales — Smart Outreach Routing Spec
**Version:** v1  
**Purpose:** Add phone intelligence, email fallback, and channel-aware outreach routing to JAB Sales using:
- **Hunter.io** for phone + email enrichment
- **Twilio Lookup v2 / Line Type Intelligence** for phone classification
- **TextLink API** for SMS delivery
- **Google Workspace / Gmail API** for email delivery from `admin@jordanborden.com`
- **Airtable** as the primary database

---

## 1. Problem Statement

Today, JAB Sales can press the green **Outreach** button and immediately send an SMS to the number returned by Hunter.io.

Current issue:
- Hunter may return a phone number, but JAB Sales cannot tell whether that number is:
  - mobile
  - landline
  - fixed VoIP
  - non-fixed VoIP
  - toll-free
- As a result, SMS may be sent to non-mobile numbers, reducing deliverability and wasting outreach attempts.

Business requirement:
- **Only send SMS if the number is mobile**
- **Still store all phone numbers**, even if landline, because they are useful for call follow-up and record completeness
- **If Hunter provides a company email**, enable email outreach as an alternative or fallback
- **Send personalized emails** from `admin@jordanborden.com` using Google Workspace

---

## 2. Goals

### Primary goals
1. Prevent SMS sends to non-mobile phone numbers
2. Add email outreach when Hunter provides an email address
3. Keep all phone numbers for future call follow-up
4. Make the **Outreach** button smart and channel-aware
5. Store all enrichment and outreach decisions in Airtable

### Secondary goals
1. Improve UI clarity on whether a prospect is textable, emailable, or call-only
2. Support future sequencing across SMS + email + call follow-up
3. Make routing logic deterministic and explainable

---

## 3. High-Level Channel Logic

Each prospect can have up to three contact channels:

- **SMS**
- **Email**
- **Call**

### Channel eligibility rules

#### SMS
Allowed only if:
- Twilio Lookup returns `mobile`

Blocked if:
- `landline`
- `fixedVoip`
- `nonFixedVoip`
- `tollFree`
- `unknown`
- lookup failed
- no phone number

#### Email
Allowed if:
- Hunter returns an email address
- email passes basic validity checks
- optional: Hunter verification/confidence meets threshold

#### Call
Allowed if:
- any phone number exists, regardless of line type

---

## 4. User Experience Requirements

### Prospect card behavior

When a fresh prospect loads:
- Show company name
- Show website
- Show current communication capability badges
- Show dynamic action buttons based on eligibility

### Desired UI states

#### Case A — Mobile phone only
- Badge: `SMS Ready`
- Outreach button enabled
- Clicking Outreach sends SMS

#### Case B — Mobile phone + email
- Badges: `SMS Ready`, `Email Ready`
- Outreach button becomes:
  - either `Choose Channel`
  - or defaults to SMS and exposes Email in secondary action menu

#### Case C — Landline + email
- Badges: `Call Only`, `Email Ready`
- Do **not** send SMS
- Outreach button should send email or open channel selector

#### Case D — Landline only
- Badge: `Call Only`
- Outreach button disabled or relabeled to `No Auto Outreach`
- Keep number visible for manual follow-up

#### Case E — No valid phone + email
- Badge: `Email Ready`
- Outreach button sends email

#### Case F — No usable phone and no email
- Badge: `No Deliverable Channel`
- Outreach button disabled

---

## 5. Recommended UI Button-State Logic

### Current button
- `Outreach`

### Recommended behavior
Do not treat `Outreach` as "send SMS immediately."
Treat it as "initiate best available outreach channel."

### Preferred implementation options

#### Option 1 — Smart single button
Button label changes dynamically:
- `Outreach via SMS`
- `Outreach via Email`
- `Choose Channel`
- `Call Follow-up`
- `Unavailable`

#### Option 2 — Split actions
Buttons:
- `Text Outreach`
- `Email Outreach`
- `Call Follow-up`

Recommended:
- Keep the main **Outreach** button for fast use
- Add a small dropdown or modal when multiple channels are available

### Button-state matrix

| SMS Eligible | Email Eligible | Call Available | Main CTA |
|---|---|---|---|
| Yes | No | Yes | Outreach via SMS |
| Yes | Yes | Yes | Choose Channel |
| No | Yes | Yes | Outreach via Email |
| No | No | Yes | Call Follow-up |
| No | Yes | No | Outreach via Email |
| No | No | No | Unavailable |

---

## 6. Airtable Base Design

Use Airtable as the source of truth for:
- prospects
- phone intelligence
- email intelligence
- outreach attempts
- message threads
- activity logs

### Recommended Airtable tables

1. `Prospects`
2. `Phones`
3. `Emails`
4. `Outreach Attempts`
5. `Inbox Threads`
6. `Activity Log`
7. `Templates` (optional)

---

## 7. Airtable Table Schemas

---

### Table: `Prospects`

**Purpose:** Master company/prospect record

#### Fields
- `Prospect ID` — Single line text, unique internal ID
- `Company Name` — Single line text
- `Website URL` — URL
- `Domain` — Single line text
- `Industry` — Single line text
- `Location` — Single line text
- `Intent Score` — Number
- `Status` — Single select
  - `new`
  - `enriched`
  - `channel_scored`
  - `outreached`
  - `disqualified`
  - `unreachable`
- `Primary Phone Record ID` — Link to `Phones`
- `Primary Email Record ID` — Link to `Emails`
- `Outreach Capability` — Single select
  - `sms_only`
  - `email_only`
  - `sms_and_email`
  - `call_only`
  - `call_and_email`
  - `unreachable`
- `SMS Eligible` — Checkbox or formula
- `Email Eligible` — Checkbox or formula
- `Call Eligible` — Checkbox or formula
- `Last Channel Decision` — Single line text
- `Last Outreach Attempt At` — Date/time
- `Last Outreach Channel` — Single select
  - `sms`
  - `email`
  - `call`
- `Owner` — Single line text or collaborator
- `Created At` — Created time
- `Updated At` — Last modified time

---

### Table: `Phones`

**Purpose:** Store phone numbers and Twilio line type intelligence

#### Fields
- `Phone Record ID` — Single line text, unique internal ID
- `Prospect` — Link to `Prospects`
- `Source` — Single select
  - `hunter`
  - `manual`
  - `other`
- `Phone Raw` — Single line text
- `Phone E164` — Single line text
- `Normalized` — Checkbox
- `Lookup Status` — Single select
  - `pending`
  - `success`
  - `failed`
  - `not_attempted`
- `Line Type` — Single select
  - `mobile`
  - `landline`
  - `fixedVoip`
  - `nonFixedVoip`
  - `tollFree`
  - `unknown`
- `Carrier Name` — Single line text
- `Country Code` — Single line text
- `Phone Valid` — Checkbox
- `SMS Eligible` — Checkbox
- `Call Eligible` — Checkbox
- `Line Type Source` — Single line text
- `Lookup Error` — Long text
- `Lookup Last Checked At` — Date/time
- `Hunter Confidence` — Number (optional if available)
- `Preferred Phone` — Checkbox
- `Created At` — Created time
- `Updated At` — Last modified time

#### Formula logic examples
- `Call Eligible` = true if `Phone E164` is not empty
- `SMS Eligible` = true only if `Line Type = mobile`

---

### Table: `Emails`

**Purpose:** Store Hunter-discovered emails and verification metadata

#### Fields
- `Email Record ID` — Single line text, unique internal ID
- `Prospect` — Link to `Prospects`
- `Source` — Single select
  - `hunter_domain_search`
  - `hunter_email_finder`
  - `hunter_manual`
  - `manual`
- `Email Address` — Email field
- `Email Type` — Single select
  - `person_specific`
  - `role_based`
  - `generic`
  - `unknown`
- `Hunter Confidence` — Number
- `Verification Status` — Single select
  - `verified`
  - `accept_all`
  - `risky`
  - `invalid`
  - `unknown`
- `Email Eligible` — Checkbox
- `Preferred Email` — Checkbox
- `First Name` — Single line text
- `Last Name` — Single line text
- `Position` — Single line text
- `Personalization Notes` — Long text
- `Created At` — Created time
- `Updated At` — Last modified time
- 'Attachment' - graphic to attach to email.

#### Eligibility rule
- `Email Eligible = true` when:
  - email exists
  - verification status is not `invalid`
  - optional: confidence above threshold, e.g. `>= 70`

---

### Table: `Outreach Attempts`

**Purpose:** Every outbound action across SMS/email/call

#### Fields
- `Attempt ID` — Single line text
- `Prospect` — Link to `Prospects`
- `Channel` — Single select
  - `sms`
  - `email`
  - `call`
- `Channel Decision Snapshot` — Long text / JSON
- `Phone` — Link to `Phones`
- `Email` — Link to `Emails`
- `Message Template ID` — Single line text
- `Personalized Subject` — Single line text
- `Personalized Body` — Long text
- `Delivery Provider` — Single select
  - `textlink`
  - `gmail_api`
- `Provider Message ID` — Single line text
- `Status` — Single select
  - `queued`
  - `sent`
  - `delivered`
  - `failed`
  - `blocked`
  - `skipped`
- `Blocked Reason` — Single line text
- `Error Detail` — Long text
- `Sent At` — Date/time
- `Created At` — Created time

---

### Table: `Inbox Threads`

**Purpose:** Unified inbox thread tracking

#### Fields
- `Thread ID` — Single line text
- `Prospect` — Link to `Prospects`
- `Channel` — Single select
  - `sms`
  - `email`
- `Provider Thread ID` — Single line text
- `Latest Message At` — Date/time
- `Thread Status` — Single select
  - `active`
  - `muted`
  - `qualified`
  - `disqualified`
  - `closed`
- `Unread Count` — Number
- `Last Direction` — Single select
  - `outbound`
  - `inbound`
- `Preview Text` — Long text

---

### Table: `Activity Log`

**Purpose:** System audit trail

#### Fields
- `Activity ID` — Single line text
- `Prospect` — Link to `Prospects`
- `Type` — Single select
  - `prospect_created`
  - `hunter_enriched`
  - `twilio_lookup_completed`
  - `email_found`
  - `channel_scored`
  - `sms_sent`
  - `email_sent`
  - `outreach_blocked`
  - `prospect_disqualified`
  - `manual_override`
- `Actor` — Single line text
  - `system`
  - `user`
- `Detail` — Long text / JSON
- `Created At` — Created time

---

## 8. Internal Derived Fields

These should be computed by backend logic, then persisted to Airtable.

### `smsEligible`
```ts
smsEligible = phone.lineType === "mobile"
````

### `emailEligible`

```ts
emailEligible = !!email.address && email.verificationStatus !== "invalid"
```

### `callEligible`

```ts
callEligible = !!phone.phoneE164
```

### `outreachCapability`

```ts
if (smsEligible && emailEligible) return "sms_and_email";
if (smsEligible && !emailEligible) return "sms_only";
if (!smsEligible && emailEligible && callEligible) return "call_and_email";
if (!smsEligible && emailEligible && !callEligible) return "email_only";
if (!smsEligible && !emailEligible && callEligible) return "call_only";
return "unreachable";
```

---

## 9. External Integrations

---

### 9.1 Hunter.io

Use Hunter for:

* company/domain-based phone and email enrichment
* email discovery
* optional email verification metadata

#### Hunter responsibilities

* provide phone number if available
* provide company email or person email if available
* provide domain/company metadata

#### Important rule

Hunter phone numbers should **never** be considered SMS-safe by default.

---

### 9.2 Twilio Lookup v2 / Line Type Intelligence

Use Twilio only for classifying phone numbers before SMS.

#### Purpose

Given a phone number from Hunter:

* normalize it
* check line type
* store classification
* decide SMS eligibility

#### Accepted outcomes

* `mobile`
* `landline`
* `fixedVoip`
* `nonFixedVoip`
* `tollFree`
* `unknown`

#### Core rule

Only `mobile` is textable.

---

### 9.3 TextLink API

Use TextLink only after a prospect passes the SMS gate.

#### Rule

Do not call TextLink if:

* line type is not `mobile`
* phone number is missing
* lookup failed
* explicit manual block exists

---

### 9.4 Gmail API / Google Workspace

Use Gmail API to send personalized outreach from:

* `admin@jordanborden.com`

#### Requirements

* outbound email should appear as sent from `admin@jordanborden.com`
* store provider message ID and thread ID
* save subject/body snapshot to Airtable
* future replies can be mapped into `Inbox Threads`

---

## 10. Backend Services

Recommended service modules:

* `hunterService`
* `twilioLookupService`
* `emailEligibilityService`
* `channelDecisionService`
* `smsOutreachService`
* `gmailOutreachService`
* `airtableService`
* `outreachOrchestrator`

---

## 11. API Design

Base path example:

* `/api/prospects`
* `/api/outreach`
* `/api/integrations`
* `/api/webhooks`

All endpoints below are illustrative and can be adapted to your stack.

---

## 12. Prospect APIs

### `POST /api/prospects/import`

Create prospects from Hunter-loaded results.

#### Request body

```json
{
  "source": "hunter",
  "prospects": [
    {
      "companyName": "Midtown Dental Center",
      "websiteUrl": "https://www.midtowndentalatl.com/",
      "phoneRaw": "(770) 555-1234",
      "email": "info@midtowndentalatl.com",
      "intentScore": 5
    }
  ]
}
```

#### Behavior

* creates/updates Prospect
* creates Phone record if phone exists
* creates Email record if email exists
* queues phone lookup
* computes provisional channel status

---

### `GET /api/prospects/:prospectId`

Return prospect with channel intelligence and UI state.

#### Response shape

```json
{
  "prospectId": "pros_123",
  "companyName": "Midtown Dental Center",
  "websiteUrl": "https://www.midtowndentalatl.com/",
  "intentScore": 5,
  "phone": {
    "raw": "(770) 555-1234",
    "e164": "+17705551234",
    "lineType": "mobile",
    "smsEligible": true,
    "callEligible": true
  },
  "email": {
    "address": "info@midtowndentalatl.com",
    "eligible": true
  },
  "outreachCapability": "sms_and_email",
  "buttonState": {
    "label": "Choose Channel",
    "enabled": true,
    "availableChannels": ["sms", "email", "call"]
  }
}
```

---

### `POST /api/prospects/:prospectId/refresh-enrichment`

Re-run enrichment for phone/email intelligence.

#### Behavior

* re-fetch Hunter email if needed
* re-run Twilio lookup if stale or missing
* recompute channel decision
* update Airtable

---

## 13. Phone Intelligence APIs

### `POST /api/integrations/twilio/lookup`

Lookup a phone number and persist classification.

#### Request body

```json
{
  "prospectId": "pros_123",
  "phoneRecordId": "phn_123",
  "phoneRaw": "(770) 450-8843"
}
```

#### Response

```json
{
  "success": true,
  "phoneRecordId": "phn_123",
  "phoneE164": "+17704508843",
  "lineType": "landline",
  "carrierName": "Example Carrier",
  "smsEligible": false,
  "callEligible": true
}
```

#### Behavior

* normalize to E.164
* call Twilio Lookup v2
* store result in Airtable `Phones`
* update `Prospects` eligibility fields
* write activity log

---

### `POST /api/prospects/:prospectId/phone/recheck`

Re-run Twilio lookup for existing phone

#### Use cases

* stale lookup
* manual refresh
* phone updated

---

## 14. Email APIs

### `POST /api/integrations/hunter/find-email`

Attempt to find or refresh email for prospect.

#### Request body

```json
{
  "prospectId": "pros_123",
  "domain": "midtowndentalatl.com",
  "firstName": "Midtown",
  "lastName": "Dental"
}
```

#### Behavior

* check if email already exists
* use Hunter Domain Search or Email Finder
* rank results
* store best email in Airtable
* mark `Preferred Email`
* update prospect `Email Eligible`

---

### `POST /api/prospects/:prospectId/email/select`

Manually select preferred email if multiple are found.

#### Request body

```json
{
  "emailRecordId": "eml_123"
}
```

---

## 15. Outreach APIs

### `POST /api/outreach/preview`

Return the system’s recommended channel and message preview.

#### Request body

```json
{
  "prospectId": "pros_123"
}
```

#### Response

```json
{
  "recommendedChannel": "email",
  "availableChannels": ["email", "call"],
  "blockedChannels": [
    {
      "channel": "sms",
      "reason": "Phone classified as landline"
    }
  ],
  "smsPreview": null,
  "emailPreview": {
    "subject": "Quick question for Midtown Dental Center",
    "body": "Hi there, I noticed..."
  },
  "buttonState": {
    "label": "Outreach via Email",
    "enabled": true
  }
}
```

---

### `POST /api/outreach/send`

Send outreach through the selected or recommended channel.

#### Request body

```json
{
  "prospectId": "pros_123",
  "channel": "sms",
  "templateId": "tmpl_roofing_intro_v1",
  "manualOverride": false
}
```

#### Behavior

1. load prospect + channel intelligence
2. validate requested channel
3. block invalid SMS attempts
4. build personalized message
5. send via provider
6. save to `Outreach Attempts`
7. update `Inbox Threads`
8. update `Prospects.Last Outreach Attempt At`

#### Failure example

```json
{
  "success": false,
  "channel": "sms",
  "reason": "Blocked: line type is landline"
}
```

---

### `POST /api/outreach/smart-send`

One-click smart outreach based on system routing rules.

#### Request body

```json
{
  "prospectId": "pros_123",
  "templateFamily": "initial_outreach"
}
```

#### Routing logic

* if SMS eligible → send SMS
* else if Email eligible → send Email
* else if Call eligible → return call-only recommendation
* else block

#### Response

```json
{
  "success": true,
  "chosenChannel": "email",
  "reason": "SMS blocked because phone is landline; email available"
}
```

---

## 16. Messaging Provider APIs

### `POST /api/integrations/textlink/send-sms`

Internal wrapper around TextLink

#### Preconditions

* `smsEligible === true`
* phone exists
* phone line type is `mobile`

#### Request body

```json
{
  "prospectId": "pros_123",
  "phoneRecordId": "phn_123",
  "message": "Hi Dr Roof, are you still taking on new clients?"
}
```

---

### `POST /api/integrations/gmail/send-email`

Internal wrapper around Gmail API

#### Request body

```json
{
  "prospectId": "pros_123",
  "emailRecordId": "eml_123",
  "from": "admin@jordanborden.com",
  "subject": "Quick question",
  "bodyText": "Hi there...",
  "bodyHtml": "<p>Hi there...</p>"
}
```

#### Behavior

* send from Google Workspace mailbox
* capture provider message ID
* optionally capture thread ID
* persist attempt

---

## 17. Webhooks

### `POST /api/webhooks/textlink/inbound`

Receive inbound SMS reply

#### Behavior

* match to Prospect / thread
* append to `Inbox Threads`
* update unread count
* mark thread active

---

### `POST /api/webhooks/gmail/inbound`

If email reply tracking is implemented later

#### Behavior

* match inbound reply to thread
* update thread and inbox state

---

## 18. Smart Channel Decision Engine

Create one function responsible for channel routing.

### Function

```ts
decideOutreachChannel(prospect)
```

### Inputs

* phone exists?
* phone line type?
* sms eligible?
* email exists?
* email eligible?
* manual override?
* last outreach history?
* current UI action?

### Output

```json
{
  "recommendedChannel": "email",
  "availableChannels": ["email", "call"],
  "blockedChannels": [
    {
      "channel": "sms",
      "reason": "Line type is landline"
    }
  ],
  "outreachCapability": "call_and_email",
  "buttonState": {
    "label": "Outreach via Email",
    "enabled": true
  }
}
```

---

## 19. Pseudocode — Core Routing

```ts
function decideOutreachChannel(prospect) {
  const smsEligible = prospect.phone?.lineType === "mobile";
  const emailEligible =
    !!prospect.email?.address &&
    prospect.email?.verificationStatus !== "invalid";
  const callEligible = !!prospect.phone?.e164;

  if (smsEligible && emailEligible) {
    return {
      recommendedChannel: "sms",
      availableChannels: ["sms", "email", "call"],
      outreachCapability: "sms_and_email",
      buttonState: {
        label: "Choose Channel",
        enabled: true
      }
    };
  }

  if (smsEligible) {
    return {
      recommendedChannel: "sms",
      availableChannels: ["sms", "call"],
      outreachCapability: "sms_only",
      buttonState: {
        label: "Outreach via SMS",
        enabled: true
      }
    };
  }

  if (emailEligible && callEligible) {
    return {
      recommendedChannel: "email",
      availableChannels: ["email", "call"],
      outreachCapability: "call_and_email",
      buttonState: {
        label: "Outreach via Email",
        enabled: true
      },
      blockedChannels: [
        {
          channel: "sms",
          reason: `Phone classified as ${prospect.phone?.lineType || "unknown"}`
        }
      ]
    };
  }

  if (emailEligible) {
    return {
      recommendedChannel: "email",
      availableChannels: ["email"],
      outreachCapability: "email_only",
      buttonState: {
        label: "Outreach via Email",
        enabled: true
      }
    };
  }

  if (callEligible) {
    return {
      recommendedChannel: "call",
      availableChannels: ["call"],
      outreachCapability: "call_only",
      buttonState: {
        label: "Call Follow-up",
        enabled: false
      }
    };
  }

  return {
    recommendedChannel: null,
    availableChannels: [],
    outreachCapability: "unreachable",
    buttonState: {
      label: "Unavailable",
      enabled: false
    }
  };
}
```

---

## 20. Pseudocode — Outreach Button Handler

```ts
async function handleOutreachClick(prospectId) {
  const prospect = await getProspectWithChannels(prospectId);

  if (!prospect.phone?.lineType && prospect.phone?.raw) {
    await runTwilioLookup(prospect.phone.raw);
  }

  if (!prospect.email?.address && prospect.domain) {
    await tryHunterEmailDiscovery(prospect.domain);
  }

  const refreshedProspect = await getProspectWithChannels(prospectId);
  const decision = decideOutreachChannel(refreshedProspect);

  if (!decision.buttonState.enabled) {
    return {
      success: false,
      reason: "No deliverable channel available"
    };
  }

  if (decision.recommendedChannel === "sms") {
    return sendSmsOutreach(refreshedProspect);
  }

  if (decision.recommendedChannel === "email") {
    return sendEmailOutreach(refreshedProspect);
  }

  return {
    success: false,
    reason: "Manual follow-up required"
  };
}
```

---

## 21. Personalization Requirements

### SMS

Short, direct, conversational

### Email

Personalized using:

* company name
* website/domain
* industry
* niche-specific pain point
* optionally page title / homepage summary
* intent score

### Example email personalization inputs

* `Company Name`
* `Website URL`
* `Industry`
* `Intent Score`
* `Preferred Email`
* `Phone Line Type`
* `Prior Outreach Attempts`

---

## 22. Logging + Audit Requirements

Every important action must be persisted:

* Hunter prospect imported
* Twilio lookup success/failure
* email found
* channel decision computed
* SMS blocked because non-mobile
* email sent
* SMS sent
* provider failure
* manual override

This should go to:

* `Outreach Attempts`
* `Activity Log`

---

## 23. Manual Override Rules

Manual override should exist, but be limited.

### Allowed overrides

* select Email instead of SMS when both available
* select a different email if multiple found
* re-run Twilio lookup
* re-run Hunter email discovery

### Disallowed override by default

* sending SMS to non-mobile numbers

If this is ever supported, require:

* explicit admin-only override
* warning modal
* log entry in `Activity Log`

---

## 24. Recommended Build Order

### Phase 1 — Phone Intelligence Gate

* Add `Phones` table
* Run Twilio Lookup on Hunter phone results
* Persist line type
* Compute SMS eligibility
* Update UI badges
* Block SMS unless mobile

### Phase 2 — Email Fallback

* Add `Emails` table
* Save Hunter email if present
* Add email discovery endpoint
* Add Gmail sending from `admin@jordanborden.com`
* Enable email outreach button/state

### Phase 3 — Smart Routing

* Add decision engine
* Make Outreach button dynamic
* Add preview endpoint
* Add `smart-send`

### Phase 4 — Unified Inbox Expansion

* merge SMS + email activity into unified thread model
* reply tracking
* sequencing
* analytics

---

## 25. Acceptance Criteria

### Phone intelligence

* Every Hunter phone is saved, even if non-mobile
* Every saved phone can be classified via Twilio
* SMS can only be sent if line type is `mobile`

### Email fallback

* If Hunter email exists, it is stored in Airtable
* If SMS is blocked and email is eligible, Outreach routes to email

### UI

* Prospect cards show line type / readiness
* Outreach button reflects channel availability
* Unified Inbox can distinguish SMS threads from future email threads

### Airtable

* Prospect, phone, email, and outreach attempt records remain linked
* all outbound sends are logged
* all block reasons are auditable

---

## 26. Recommended Internal Enums

### Phone line type enum

```ts
type PhoneLineType =
  | "mobile"
  | "landline"
  | "fixedVoip"
  | "nonFixedVoip"
  | "tollFree"
  | "unknown";
```

### Outreach capability enum

```ts
type OutreachCapability =
  | "sms_only"
  | "email_only"
  | "sms_and_email"
  | "call_only"
  | "call_and_email"
  | "unreachable";
```

### Outreach channel enum

```ts
type OutreachChannel = "sms" | "email" | "call";
```

---

## 27. Final Product Behavior Summary

When a new prospect is loaded into JAB Sales:

1. Save phone and email returned by Hunter
2. Run Twilio Lookup on the phone number
3. Store line type in Airtable
4. Mark SMS eligible only if line type is `mobile`
5. If email is available, mark email eligible
6. Compute overall outreach capability
7. Render dynamic UI state
8. When Outreach is pressed:

   * send SMS if mobile
   * else send email if available
   * else preserve number for call follow-up only

This ensures:

* no accidental texting of landlines
* retained phone data for calling
* email fallback when SMS is not viable
* a cleaner, auditable outreach workflow powered by Airtable

```

If you want, I can also turn this into a second `.md` file that is even more implementation-heavy for Gemini, with example Airtable field types, REST payloads, and Express/Next.js route scaffolding.
```
# JAB Sales — Smart Outreach Routing Implementation Spec
**File:** `jab-sales-smart-outreach-implementation.md`  
**Version:** v2  
**Audience:** Gemini CLI / engineering implementation  
**Goal:** Implement smart multi-channel outreach in JAB Sales using Hunter.io, Twilio Lookup, TextLink, Gmail API, and Airtable.

---

## 1. Summary

JAB Sales currently sends SMS when the user presses the green **Outreach** button. The number is sourced from Hunter.io, but JAB Sales does not know whether the number is:

- mobile
- landline
- fixed VoIP
- non-fixed VoIP
- toll-free

This causes a delivery-quality problem because SMS may be sent to non-mobile numbers.

### New required behavior

1. Save the Hunter phone number even if it is a landline
2. Run Twilio Lookup Line Type Intelligence on the phone number
3. Only send SMS if Twilio classifies the line as `mobile`
4. If SMS is not allowed but Hunter provides a usable email address, send a personalized email instead
5. If only a non-mobile phone exists, retain it for manual call follow-up
6. Store all prospect, phone, email, and outreach activity in Airtable
7. Make the **Outreach** button dynamic and channel-aware

---

## 2. System Components

### External systems
- **Hunter.io**
  - phone enrichment
  - email enrichment
  - email discovery
- **Twilio Lookup v2**
  - Line Type Intelligence
- **TextLink API**
  - outbound SMS
- **Google Workspace / Gmail API**
  - outbound email from `admin@jordanborden.com`
- **Airtable**
  - primary database / app backend persistence

### Internal services
- `hunterService`
- `twilioLookupService`
- `airtableService`
- `channelDecisionService`
- `smsOutreachService`
- `gmailOutreachService`
- `outreachOrchestrator`

---

## 3. Channel Eligibility Rules

### SMS eligibility
SMS is allowed only if:

```ts
phone.lineType === "mobile"


Notes on twilio phone number necessity
No — you do not need to buy or provision a Twilio phone number just to use Lookup Line Type Intelligence.

Twilio’s current Lookup docs show Line Type Intelligence as a Lookup API request against any phone number you want to inspect, using your Account SID and Auth Token. The example request is to:

GET https://lookups.twilio.com/v2/PhoneNumbers/{PhoneNumber}?Fields=line_type_intelligence

Also I added an email attachment image to /public folder that should be able to be optonally attached to emails or text. The file "JAB Digital Flyer EMAIL" can be attached to an email for outreach. The file AIMastermind.png can be attached to any but the ATLAIMastermind.png should only be attached to clients in the greater atlanta metro area. Create an .md file that contains a sample of the email body that be can added later, it should include links to jordanborden.com and aimastermind.jordanborden for the workhshop attachments.
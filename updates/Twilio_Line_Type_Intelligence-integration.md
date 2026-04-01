## Integrate Twilio Lookup for phone line type detection

Integrate **Twilio Lookup v2** into `jab-sales-automation` using the **Line Type Intelligence** package so the system can programmatically determine whether a phone number is:

- `mobile`
- `landline`
- `fixedVoip`
- `nonFixedVoip`
- `tollFree`

Twilio Lookup Line Type Intelligence returns carrier and phone line type data, which can be used to decide whether a number is eligible for SMS outreach. Twilio specifically documents this feature for identifying line type and filtering out landlines before sending SMS. This is a **paid Lookup feature**, requested via the `Fields=line_type_intelligence` parameter on the Lookup v2 phone number endpoint. :contentReference[oaicite:0]{index=0}

### Objective

Before any outbound text message is sent in `jab-sales-automation`, run the prospect's phone number through Twilio Lookup and classify the number type. Use the result to prevent sending SMS to numbers that are unlikely or unable to receive text messages, improving deliverability and reducing wasted outreach. Twilio notes that line type intelligence can identify mobile, landline, fixed VoIP, non-fixed VoIP, toll-free, and more. :contentReference[oaicite:1]{index=1}

### Required behavior

1. Normalize each phone number to **E.164** format before lookup.
2. Call the Twilio Lookup v2 endpoint for the number with:
   - `Fields=line_type_intelligence`
3. Read the response from:
   - `line_type_intelligence.type`
   - `line_type_intelligence.carrier_name`
4. Save the lookup result to the lead/contact record.
5. Use the line type result to control SMS eligibility.

### SMS eligibility rules

Apply the following rules:

- `mobile` → mark as **SMS eligible**
- `landline` → mark as **not SMS eligible**
- `fixedVoip` → mark as **not SMS eligible** by default
- `nonFixedVoip` → mark as **high risk / do not auto-text**
- `tollFree` → mark as **not SMS eligible** unless explicitly approved by business logic
- `unknown`, null, invalid, or lookup error → mark as **needs review** or **skip SMS**

Twilio’s docs position this feature as a way to filter out landlines and improve deliverability by reaching the recipient on the correct channel. :contentReference[oaicite:2]{index=2}

### Implementation expectations

- Add a reusable Twilio Lookup service module inside `jab-sales-automation`.
- Pull Twilio credentials from environment variables:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
- Create a helper function such as:
  - `lookupPhoneLineType(phoneNumber)`
- The helper should:
  - validate input
  - normalize formatting
  - call Twilio Lookup
  - parse the `line_type_intelligence` payload
  - return a clean internal object

Example internal return shape:

```json
{
  "phoneNumber": "+14155550123",
  "valid": true,
  "carrierName": "Verizon",
  "lineType": "mobile",
  "smsEligible": true,
  "riskFlag": false,
  "lookupSource": "twilio_lookup_v2"
}
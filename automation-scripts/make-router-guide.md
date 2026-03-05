# Step-by-Step Guide: Make.com Router & Integrations for Phase 6

This guide will walk you through building the logic inside Make.com to handle the different actions triggered by our Sales Agent via the MCP tool (`t397_01_jab_sales_agent` or `t404_walter_jab_facebook_scenario`).

## 1. Setting Up the Make.com Router

Currently, your Make.com scenario starts with a Webhook module that receives the agent's requests. We need to split the flow based on what the agent wants to do.

1. **Open your Make.com scenario ("Walter Jab Facebook Scenario" or the main Agent Webhook).**
2. **Add a Router Module:** Click the small "plus" icon next to your Webhook trigger and search for **Router** (under Flow Control). Connect it to the webhook.
3. The Router will give you multiple branches (paths). We will create two main branches.

---

## 2. Branch 1: `book_workshop` (Google Calendar & Airtable CRM Sync)

1. **Set up the Filter:** Click the wrench icon 🔧 on the dotted line connecting to the first branch.
   - **Label:** `Book Workshop`
   - **Condition:** In the first field, select the `action` variable from your Webhook module.
   - **Operator:** `Equal to`
   - **Value:** type in exactly `book_workshop`

2. **Add Google Calendar - Create an Event:**
   - Click the plus at the end of Branch 1 and add **Google Calendar**.
   - Select the action **Create an Event**.
   - Choose your connected Google connection.
   - Select the Calendar where the 90-min AI Workshops happen.
   - **Event Name:** E.g., `AI Workshop: {{name}}` (map `name` from the webhook).
   - **Start/End Date:** Map the dates based on the `sessionId` or `date` provided by the webhook.
   - **Attendees:** Map the `email` field from the webhook.

3. **Add Airtable - Create a Record (Participants/Registrations):**
   - After the Google Calendar module, add an **Airtable** module.
   - Select **Create a Record**.
   - **Base:** AI Mastermind / JAB Sales OS Base
   - **Table:** `Participants`
   - **Full Name:** map the `name` field from the webhook.
   - **Email:** map the `email` field from the webhook.

---

## 3. Branch 2: `schedule_followup` (Airtable Follow-Up Tasks)

1. **Set up the Filter:** Click the wrench icon 🔧 on the dotted line connecting to the second branch.
   - **Label:** `Schedule Follow-Up`
   - **Condition:** Select the `action` variable from your Webhook.
   - **Operator:** `Equal to`
   - **Value:** type in `add_follow_up_task` (or `schedule_followup` depending on your prompt).

2. **Add Airtable - Create a Record (Follow-Up Tasks):**
   - Click the plus at the end of Branch 2 and add an **Airtable** module.
   - Select **Create a Record**.
   - **Base:** AI Mastermind / JAB Sales OS Base
   - **Table:** `Follow-Up Tasks`
   - **Task Name:** `Follow up with lead`
   - **Lead (Linked Record):** Map the `lead_id` array from the webhook.
   - **Due At:** Map the date/time from the webhook.
   - **Reason:** Map the `reason` field from the webhook.
   - **Status:** Set statically to `Open`.

---

## 4. Testing the Setup

Once you have built this out in Make.com:
1. Click **Run once** in Make.com.
2. I have a script ready that will trigger the MCP tool to send test payloads for both `book_workshop` and `add_follow_up_task`.
3. Watch the bubbles in Make.com turn green and verify that Google Calendar events and Airtable records are successfully created!

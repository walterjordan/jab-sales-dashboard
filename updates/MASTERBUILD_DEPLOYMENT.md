# Masterbuild Deployment Guide & Upgrade Path

This document outlines the architectural changes made during the "Smart Outreach" Masterbuild (Version 1.1) and provides the necessary steps for cloud deployment.

## 1. Architectural Changes (v1.1)
The JAB Sales Agent has been upgraded to a proactive, channel-aware Sales Associate.

- **Twilio Line Type Intelligence:** Integrated into the `prospect` API and `outreach` API. Validates whether a phone number is a mobile, landline, or VoIP before attempting SMS delivery.
- **Hunter.io Enrichment:** Automatically scans domains and websites of prospects to find direct email addresses.
- **Gmail API Integration:** The `send_email` tool in the MCP now utilizes real OAuth2 delivery via `support@jordanborden.com`, completely replacing the mocked version.
- **Smart Routing Logic:** The system automatically defaults to SMS for mobile lines and falls back to a personalized AI-generated email for landlines.
- **Dashboard UI Badges:** The `jab-cloud-gateway` now dynamically renders intelligence badges (`Mobile`, `Landline`, `Enriched`, `Unverified`) based on Airtable data.
- **Universal Real-Time Alerts:** All inbound messages (SMS and Messenger) now automatically trigger a real-time SMS alert to `+17703132589`, containing the lead's name, channel, full message content, and a direct link to the dashboard for immediate human intervention.

## 2. Required Cloud Secrets
Before pushing the new `jab-sales-tools-mcp` to Google Cloud Run, you MUST add the following secrets to Google Cloud Secret Manager so the cloud container can access them:

1. `GMAIL_CLIENT_ID`
2. `GMAIL_CLIENT_SECRET`
3. `GMAIL_REFRESH_TOKEN`
4. `HUNTER_API_KEY`
5. `TWILIO_ACCOUNT_SID`
6. `TWILIO_AUTH_TOKEN`

*(Note: Ensure your Cloud Run service account has the "Secret Manager Secret Accessor" role for these new secrets).*

## 3. Suggested Future Upgrades (v1.2+)

To make the system truly autonomous, consider the following upgrades:

- **Inbound Webhook Listeners for Gmail:** Currently, outbound emails are logged in Airtable, but replies go straight to the `support@jordanborden.com` inbox. We should set up a Google Cloud Pub/Sub push notification or a Make.com watcher to automatically log email replies back into the `Conversations` table and notify the AI.
- **Cron Job for Intelligence Backfill:** Set up a Google Cloud Scheduler job to run the `backfill-intelligence.js` script automatically every night. This ensures any manually imported leads are scanned by Twilio and Hunter without human intervention.
- **Dynamic Attachment Logic:** Update the Agent's instructions to actively choose which attachment to send (e.g., `AIMastermind.png` vs `ATLAIMastermind.png`) based on the lead's location data in Airtable.

## 4. Development & Session Context (v1.1 Setup Notes)
*(Context preserved for future AI sessions to resume work seamlessly)*

- **Airtable Schema Updates:** During v1.1, the `Leads` table (`tblXC5DVlvsecX8GC`) was modified. It now strictly requires the following fields: 
  - `Line Type` (Single line text)
  - `Carrier` (Single line text)
  - `Hunter Enriched` (Checkbox)
  - `Tags` (Single line text - though the backfill script handles parsing if it's an Array).
- **Environment Variable Naming:** To prevent collisions with existing Google OAuth applications in GCP Secret Manager, the email-sending credentials were explicitly prefixed with `GMAIL_` (i.e., `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`). The OAuth playground redirect URI `https://developers.google.com/oauthplayground` was used to generate the token.
- **Backfill Script:** `automation-scripts/backfill-intelligence.js` processes 50 records at a time to stay under Airtable API rate limits. It updates older leads with Twilio/Hunter data.
- **Deployment Quirk (Cloud Run):** If an environment variable was previously deployed as a literal string (e.g., `Textlinksms_api_key`) and is being converted to a Secret, the deployment will fail unless `--clear-env-vars` and `--clear-secrets` are passed first to wipe the slate clean.
- **Live Notifications:** Universal SMS alerts are currently hardcoded to route to `+17703132589` via the `NOTIFY_PHONE` environment variable in `jab-cloud-gateway`.

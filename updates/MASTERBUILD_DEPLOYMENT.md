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

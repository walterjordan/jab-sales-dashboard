# NotebookLM MCP Connector Implementation Plan
**Status:** Integrated & Verified on Cloud Run
**Last Updated:** March 2, 2026

## 1. Objective
Enable the AI Mastermind App (and other agents like JAB Sales Agent) to programmatically interact with Google NotebookLM via the Model Context Protocol (MCP).

## 2. Current Architecture & Progress
We have successfully connected the NotebookLM MCP server to the OpenAI Agent Builder by deploying it to Google Cloud Run, eliminating the need for local tunneling tools like ngrok/localtunnel.

### **Completed Steps**
-   [x] **Tool Selection:** `notebooklm-mcp-cli` installed and configured.
-   [x] **Environment Setup:** Authentication mapped via `cookies.json` for headless server support.
-   [x] **FastAPI Bridge:** Developed a custom `bridge.py` to adapt the local MCP server into a stateless HTTP/SSE server compatible with Cloud Run.
-   [x] **Cloud Deployment:** Containerized and deployed to GCP Cloud Run (`https://notebooklm-mcp-4w2x2slmya-uc.a.run.app`).
-   [x] **Agent Builder Integration:** Connected via **"Hosted: MCP server"** tool in OpenAI Agent Builder.
    *   **Mode:** SSE (`/sse` path)
    *   **URL:** `https://notebooklm-mcp-4w2x2slmya-uc.a.run.app/sse`
    *   **Authentication:** None

## 3. Key Files
| File | Purpose |
| :--- | :--- |
| `setup_notebooklm_mcp.ps1` | Setup script for local testing and initial authentication (`nlm login`). |
| `Dockerfile` | Builds the Python FastAPI MCP bridge (uses `cookies.json` for auth). |
| `bridge.py` | Adapts the NotebookLM MCP tools to stateless HTTP/SSE requests for Cloud Run. |
| `cookies.json` | Stores the Google session tokens used by the headless Docker container. |
| `NOTEBOOKLM_MCP_README.md` | Detailed manual for running the server and configuring clients. |

## 4. How to Update Authentication
If the Cloud Run service stops working due to expired Google session cookies (typically lasts a few weeks):

1.  Run the local setup script to refresh cookies: `.\setup_notebooklm_mcp.ps1`
2.  Copy the new cookies from your local profile (`~/.notebooklm-mcp-cli/jordanborden_cookies.json` or run `nlm login --export` to `cookies.json`).
3.  Rebuild and deploy to Cloud Run:
    ```bash
    gcloud run deploy notebooklm-mcp --source . --region us-central1
    ```

## 5. Future Considerations
-   **Automated Token Refresh:** Implement a mechanism to programmatically refresh or cycle Google auth cookies without requiring a local browser session.
-   **IAM Enforcement:** Transition away from `allUsers` invoker permissions if the OpenAI Agent Builder ever supports passing proper `Authorization: Bearer` tokens.

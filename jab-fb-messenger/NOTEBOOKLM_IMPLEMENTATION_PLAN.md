# NotebookLM MCP Connector Implementation Plan
**Status:** Integrated & Verified
**Last Updated:** February 12, 2026

## 1. Objective
Enable the AI Mastermind App (and other agents) to programmatically interact with Google NotebookLM.

## 2. Current Architecture & Progress
We have successfully connected the local MCP server to the OpenAI Agent Builder using `public tunnel`.

### **Completed Steps**
-   [x] **Tool Selection:** `notebooklm-mcp-cli` installed and configured.
-   [x] **Environment Setup:** `setup_notebooklm_mcp.ps1` created and verified.
-   [x] **OpenAPI Generation:** `notebooklm-openapi.json` generated (for custom actions).
-   [x] **Agent Builder Integration:** Connected via **"MCP server"** (Hosted) tool using `public tunnel`.
    *   **Mode:** SSE (`--transport sse`)
    *   **Port:** 8000
    *   **URL Pattern:** `https://<public tunnel-id>.public tunnel-free.app/sse`
-   [x] **Chatkit Integration:** Added floating chat widget to `src/app/layout.tsx`.

## 3. Key Files
| File | Purpose |
| :--- | :--- |
| `setup_notebooklm_mcp.ps1` | **Run this first.** Installs Python deps, creates `.venv`, and prompts for Google login (`nlm login`). |
| `Dockerfile.mcp` | Dockerfile for building the Python MCP server (use `-f Dockerfile.mcp` when deploying). |
| `notebooklm-openapi.json` | API definition for "Import from JSON" actions (fallback method). |
| `mcp-settings.json` | Config snippet for local MCP clients (Claude/Cursor). |
| `NOTEBOOKLM_MCP_README.md` | Detailed manual for running the server and connecting via public tunnel. |

## 4. How to Resume (Next Session)

To get the **JAB_AI_MCP** working again after a restart:

1.  **Open Terminal 1 (Server):**
    ```powershell
    .venv\Scripts\python -m notebooklm_tools.mcp.server --transport sse --port 8000
    ```

2.  **Open Terminal 2 (Tunnel):**
    ```powershell
    .\public tunnel http 8000
    ```

3.  **Update Agent Builder:**
    *   Copy the *new* forwarding URL from public tunnel (e.g., `https://a1b2c3d4.public tunnel-free.app`).
    *   Go to your agent in the builder.
    *   Edit the **JAB_AI_MCP** tool settings.
    *   Update the URL to: `https://<NEW_TUNNEL_ID>.public tunnel-free.app/sse`

## 5. Future Considerations
-   **Static Domain:** Consider a paid public tunnel plan or a static domain to avoid updating the URL every time you restart.
-   **Cloud Hosting:** To make the agent run 24/7 without your laptop, we would need to deploy this Docker container to Cloud Run (requires solving the browser auth challenge).

---
**Note for Gemini:** When picking this up, check if `.venv` exists. If not, run the setup script. Use `notebooklm-openapi.json` as the source of truth for available tool definitions.

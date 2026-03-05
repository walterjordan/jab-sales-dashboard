# NotebookLM MCP Connector Guide

This package provides a Model Context Protocol (MCP) server for Google NotebookLM, allowing you to connect it to AI agents like Claude, Cursor, Windsurf, or custom automation tools.

## Prerequisites

- **Python 3.10+** installed.
- **Google Chrome** (for authentication via `nlm login`).

## Setup

1.  **Run the automated setup script:**
    ```powershell
    .\setup_notebooklm_mcp.ps1
    ```
    This will create a virtual environment, install dependencies, and prompt you to log in to Google.

2.  **Authenticate:**
    The setup script will run `nlm login`. follow the instructions to authenticate.
    Usually, this involves copying an auth code or confirming in a browser.

## Running the Server

### Option A: Local Agents (Stdio)
For tools like Claude Desktop or Cursor that run locally:
Run the server using the `.venv` created:
```powershell
.venv\Scripts
otebooklm-mcp
```
(Or use the provided `mcp-settings.json` configuration).

### Option B: OpenAI Custom GPTs (Agent Builder)
To connect this MCP server to the new OpenAI Agent Builder, you must use a publicly accessible endpoint (like Google Cloud Run).

1.  **Ensure Server is Public:**
    We have deployed the server to Google Cloud Run. The public URL is:
    `https://notebooklm-mcp-4w2x2slmya-uc.a.run.app`

2.  **Add Tool in OpenAI:**
    - Go to your OpenAI Agent Builder (Custom GPT).
    - Under "Tools", click the `+` icon and select **Hosted: MCP Server**.
    - Set the Name to something descriptive (e.g., `jab_knowledge_brain`).
    - Set the URL to: `https://notebooklm-mcp-4w2x2slmya-uc.a.run.app/sse` (the `/sse` path is required).
    - Set Authentication to `None` and Approval to your preference.
    - Click Update. The tools (like `notebook_query`) will populate automatically.

## Configuration for MCP Clients

Copy the contents of `mcp-settings.json` to your MCP client configuration file (e.g., `~/AppData/Roaming/Claude/claude_desktop_config.json`).

## Troubleshooting

- **Authentication Errors:** Run `.venv\Scripts
lm login` again.
- **Missing Tools:** Ensure you have updated the package: `.venv\Scripts\pip install --upgrade notebooklm-mcp-cli`.

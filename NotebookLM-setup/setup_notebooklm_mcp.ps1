# Setup NotebookLM MCP Server for AI Mastermind App
# This script installs dependencies, logs in, and prepares the environment.

$ErrorActionPreference = "Stop"

Write-Host "Checking for Python..."
try {
    python --version
} catch {
    Write-Error "Python is not installed or not in your PATH. Please install Python 3.10+."
    exit 1
}

if (!(Test-Path ".venv")) {
    Write-Host "Creating virtual environment (.venv)..."
    python -m venv .venv
} else {
    Write-Host "Virtual environment exists."
}

Write-Host "Installing notebooklm-mcp-cli..."
& .venv\Scripts\python -m pip install --upgrade pip
& .venv\Scripts\python -m pip install notebooklm-mcp-cli

Write-Host "`nIMPORTANT: Authenticating with Google NotebookLM..."
Write-Host "Running 'nlm login'. A browser window may open, or you may need to follow instructions."
try {
    & .venv\Scripts\nlm login
} catch {
    Write-Warning "Authentication may have failed or was cancelled. Run '.venv\Scripts\nlm login' manually if needed."
}

Write-Host "`nSetup Complete!"
Write-Host "--------------------------------------------------------"
Write-Host "To run the MCP server for local agents:"
Write-Host "  .venv\Scripts\notebooklm-mcp"
Write-Host "`nTo run for OpenAI Custom GPTs (via HTTP Bridge):"
Write-Host "  1. Start server: .venv\Scripts\notebooklm-mcp --transport http --port 8000"
Write-Host "  2. Expose port publicly (e.g., via Cloud Run or tunnel)"
Write-Host "  3. Use 'notebooklm-openapi.json' in OpenAI Action config."
Write-Host "--------------------------------------------------------"

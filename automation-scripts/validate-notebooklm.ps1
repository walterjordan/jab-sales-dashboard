# Validation Script: NotebookLM MCP
# Run this script to test if the NotebookLM CLI is authenticated and working.

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mcpDir = Join-Path -Path $scriptDir -ChildPath "..\NotebookLM-setup"

Write-Host "Validating NotebookLM CLI connection..."
Set-Location -Path $mcpDir

try {
    # Check if the CLI is accessible and authenticated
    & .\.venv\Scripts\nlm notebook list
    if ($LASTEXITCODE -ne 0) {
        Write-Error "NotebookLM CLI validation failed."
    } else {
        Write-Host "NotebookLM CLI connection is valid."
    }
} catch {
    Write-Error "NotebookLM CLI validation failed. Please ensure you have run '.\setup_notebooklm_mcp.ps1' and provided valid cookies if browser login fails."
}

# Validation Script: Make.com MCP Server
# This script checks if the Make.com MCP endpoint is reachable.
# Note: Since Make.com MCP requires specific headers/auth, this is a basic reachability check.

$ErrorActionPreference = "Stop"

Write-Host "Validating Make.com MCP server connection..."

$mcpUrl = "https://us2.make.com/mcp/server/18d1a69c-7de4-4c86-abbe-5ae1afca9052"

try {
    # We are doing a basic HTTP request to see if the domain/path resolves.
    # We expect a 400/401/405 depending on the MCP implementation if we just GET it, 
    # but as long as it doesn't timeout/fail DNS, the endpoint is live.
    $response = Invoke-WebRequest -Uri $mcpUrl -Method Post -UseBasicParsing -ErrorAction SilentlyContinue
    
    # If we get here, it means it returned 200 OK
    Write-Host "Make.com MCP server responded successfully. (Status: $($response.StatusCode))"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 401 -or $statusCode -eq 404 -or $statusCode -eq 405) {
        Write-Host "Make.com MCP server is reachable (returned $statusCode as expected for unauthenticated/invalid payload)."
    } else {
        Write-Error "Make.com MCP server validation failed. Error: $($_.Exception.Message)"
    }
}

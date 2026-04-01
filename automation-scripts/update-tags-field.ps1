$ErrorActionPreference = "Stop"

$apiKey = $env:AIRTABLE_API_KEY
$baseId = "appeJqZ5yjyPmh1MC"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$leadsTableId = "tblXC5DVlvsecX8GC"
$tagsFieldId = "fldN64uoxIs43lvkZ"

$body = @{
    name = "Tags"
    options = @{
        choices = @(
            @{ name = "Cold" },
            @{ name = "Warm" },
            @{ name = "Hot" },
            @{ name = "Client" },
            @{ name = "DNC" },
            @{ name = "AI-Active" },
            @{ name = "AI-Paused" },
            @{ name = "Human-Required" }
        )
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables/$leadsTableId/fields/$tagsFieldId" -Headers $headers -Method Patch -Body $body
    Write-Host "Tags field updated successfully."
} catch {
    Write-Host "Failed to update Tags field: $_"
    Write-Host "Details: $( $_.ErrorDetails.Message )"
}

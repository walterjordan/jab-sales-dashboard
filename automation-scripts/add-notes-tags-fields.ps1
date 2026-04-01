$ErrorActionPreference = "Stop"

$apiKey = $env:AIRTABLE_API_KEY
$baseId = "appeJqZ5yjyPmh1MC"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$leadsTableId = "tblXC5DVlvsecX8GC"

$leadsFields = @(
    @{ name = "Tags"; type = "multipleSelects"; options = @{ choices = @( @{ name = "AI-Active"; color = "greenLight2" }, @{ name = "AI-Paused"; color = "redLight2" } ) } }
)

foreach ($field in $leadsFields) {
    Write-Host "Adding field $($field.name) to Leads table..."
    try {
        $body = $field | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables/$leadsTableId/fields" -Headers $headers -Method Post -Body $body
        Write-Host "Field $($field.name) added successfully."
    } catch {
        Write-Host "Field $($field.name) already exists or failed to add: $_"
        Write-Host "Details: $( $_.ErrorDetails.Message )"
    }
}

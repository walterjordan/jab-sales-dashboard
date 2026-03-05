# Script to update Airtable schema for omnichannel support
$ErrorActionPreference = "Stop"

$apiKey = $env:AIRTABLE_API_KEY
$baseId = "appeJqZ5yjyPmh1MC"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$leadsTableId = "tblXC5DVlvsecX8GC"
$convosTableId = "tblHHtMcNrH9RocXN"

# 1. Update Leads Table Fields
$leadsFields = @(
    @{ name = "primary_channel"; type = "singleSelect"; options = @{ choices = @( @{ name = "webchat" }, @{ name = "sms" }, @{ name = "messenger" }, @{ name = "instagram" }, @{ name = "email" } ) } },
    @{ name = "channel_opt_in_sms"; type = "checkbox"; options = @{ icon = "check"; color = "greenBright" } },
    @{ name = "phone_e164"; type = "singleLineText" },
    @{ name = "sms_provider"; type = "singleLineText" },
    @{ name = "sms_thread_id"; type = "singleLineText" },
    @{ name = "messenger_psid"; type = "singleLineText" },
    @{ name = "meta_page_id"; type = "singleLineText" },
    @{ name = "ad_source"; type = "singleLineText" },
    @{ name = "ad_campaign_id"; type = "singleLineText" },
    @{ name = "ad_adset_id"; type = "singleLineText" },
    @{ name = "ad_ad_id"; type = "singleLineText" },
    @{ name = "dnc_sms"; type = "checkbox"; options = @{ icon = "check"; color = "redBright" } },
    @{ name = "timezone"; type = "singleLineText" },
    @{ name = "handoff_requested"; type = "checkbox"; options = @{ icon = "check"; color = "yellowBright" } }
)

foreach ($field in $leadsFields) {
    Write-Host "Adding field $($field.name) to Leads table..."
    try {
        $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables/$leadsTableId/fields" -Headers $headers -Method Post -Body ($field | ConvertTo-Json -Depth 10)
        Write-Host "Field $($field.name) added."
    } catch {
        Write-Host "Field $($field.name) already exists or failed to add: $_"
    }
}

# 2. Update Conversations Table Fields
$convosFields = @(
    @{ name = "origin_channel"; type = "singleLineText" },
    @{ name = "origin_context"; type = "multilineText" },
    @{ name = "handoff_requested"; type = "checkbox"; options = @{ icon = "check"; color = "yellowBright" } }
)

foreach ($field in $convosFields) {
    Write-Host "Adding field $($field.name) to Conversations table..."
    try {
        $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables/$convosTableId/fields" -Headers $headers -Method Post -Body ($field | ConvertTo-Json -Depth 10)
        Write-Host "Field $($field.name) added."
    } catch {
        Write-Host "Field $($field.name) already exists or failed to add: $_"
    }
}

Write-Host "Airtable schema update complete!"

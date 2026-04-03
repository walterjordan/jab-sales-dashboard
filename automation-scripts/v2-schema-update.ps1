$ErrorActionPreference = "Stop"

$apiKey = $env:AIRTABLE_API_KEY
$baseId = "appeJqZ5yjyPmh1MC"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$leadsTableId = "tblXC5DVlvsecX8GC"

# 1. Update Leads Table Fields
$leadsFields = @(
    @{ name = "FollowUpStatus"; type = "singleSelect"; options = @{ choices = @( @{ name = "NEW"; color = "blueLight2" }, @{ name = "CONTACTED"; color = "yellowLight2" }, @{ name = "WAITING"; color = "grayLight2" }, @{ name = "ENGAGED"; color = "cyanLight2" }, @{ name = "NURTURE"; color = "purpleLight2" }, @{ name = "CLOSED_WON"; color = "greenLight2" }, @{ name = "CLOSED_LOST"; color = "redLight2" } ) } },
    @{ name = "EngagementLevel"; type = "singleSelect"; options = @{ choices = @( @{ name = "NONE" }, @{ name = "LOW" }, @{ name = "MEDIUM" }, @{ name = "HIGH" } ) } },
    @{ name = "PreferredChannel"; type = "singleSelect"; options = @{ choices = @( @{ name = "SMS" }, @{ name = "EMAIL" }, @{ name = "CALL" } ) } },
    @{ name = "FollowUpStep"; type = "number"; options = @{ precision = 0 } },
    @{ name = "LastContactedAt"; type = "dateTime"; options = @{ dateFormat = @{ name = "local" }; timeFormat = @{ name = "12hour" }; timeZone = "client" } },
    @{ name = "LastResponseAt"; type = "dateTime"; options = @{ dateFormat = @{ name = "local" }; timeFormat = @{ name = "12hour" }; timeZone = "client" } },
    @{ name = "NextActionAt"; type = "dateTime"; options = @{ dateFormat = @{ name = "local" }; timeFormat = @{ name = "12hour" }; timeZone = "client" } }
)

foreach ($field in $leadsFields) {
    Write-Host "Adding field $($field.name) to Leads table..."
    try {
        $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables/$leadsTableId/fields" -Headers $headers -Method Post -Body ($field | ConvertTo-Json -Depth 10)
        Write-Host "Field $($field.name) added successfully."
    } catch {
        Write-Host "Field $($field.name) already exists or failed to add: $( $_.ErrorDetails.Message )"
    }
}

# 2. Create FollowUpSequences Table
$sequencesTableBody = @{
    name = "FollowUpSequences"
    description = "Stores automated multi-channel sequences."
    fields = @(
        @{ name = "Sequence ID"; type = "singleLineText" },
        @{ name = "StepNumber"; type = "number"; options = @{ precision = 0 } },
        @{ name = "DelayMinutes"; type = "number"; options = @{ precision = 0 } },
        @{ name = "Channel"; type = "singleSelect"; options = @{ choices = @( @{ name = "SMS" }, @{ name = "EMAIL" }, @{ name = "CALL" } ) } },
        @{ name = "MessageTemplate"; type = "multilineText" },
        @{ name = "Condition"; type = "singleLineText" }
    )
}

Write-Host "`nCreating FollowUpSequences Table..."
try {
    $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables" -Headers $headers -Method Post -Body ($sequencesTableBody | ConvertTo-Json -Depth 10)
    Write-Host "Table FollowUpSequences created successfully."
} catch {
    Write-Host "Table FollowUpSequences already exists or failed to create: $( $_.ErrorDetails.Message )"
}

# 3. Create Tasks Table
$tasksTableBody = @{
    name = "Tasks"
    description = "Human-in-the-loop task tracker."
    fields = @(
        @{ name = "Task Name"; type = "singleLineText" },
        @{ name = "Lead"; type = "multipleRecordLinks"; options = @{ linkedTableId = $leadsTableId } },
        @{ name = "TaskType"; type = "singleSelect"; options = @{ choices = @( @{ name = "CALL" }, @{ name = "REVIEW" }, @{ name = "FOLLOWUP" } ) } },
        @{ name = "Status"; type = "singleSelect"; options = @{ choices = @( @{ name = "PENDING" }, @{ name = "COMPLETE" } ) } },
        @{ name = "Notes"; type = "multilineText" },
        @{ name = "DueAt"; type = "dateTime"; options = @{ dateFormat = @{ name = "local" }; timeFormat = @{ name = "12hour" }; timeZone = "client" } }
    )
}

Write-Host "`nCreating Tasks Table..."
try {
    $response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables" -Headers $headers -Method Post -Body ($tasksTableBody | ConvertTo-Json -Depth 10)
    Write-Host "Table Tasks created successfully."
} catch {
    Write-Host "Table Tasks already exists or failed to create: $( $_.ErrorDetails.Message )"
}

Write-Host "`nV2 Airtable schema update complete!"

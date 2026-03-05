# Script to create Sales OS tables in Airtable
$ErrorActionPreference = "Stop"

$apiKey = $env:AIRTABLE_API_KEY
$baseId = "appeJqZ5yjyPmh1MC"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

# 1. Skip Leads Table Creation (Already Created)
$leadsTableId = "tblXC5DVlvsecX8GC"
Write-Host "Using existing Leads table ID: $leadsTableId"

# 2. Create Conversations Table
$convosTable = @{
    name = "Conversations"
    description = "Unified transcript for all channels"
    fields = @(
        @{ name = "Message ID"; type = "singleLineText" },
        @{ 
            name = "Lead"
            type = "multipleRecordLinks"
            options = @{
                linkedTableId = $leadsTableId
            }
        },
        @{
            name = "Channel"
            type = "singleSelect"
            options = @{
                choices = @(
                    @{ name = "Messenger" },
                    @{ name = "SMS" }
                )
            }
        },
        @{
            name = "Direction"
            type = "singleSelect"
            options = @{
                choices = @(
                    @{ name = "Inbound" },
                    @{ name = "Outbound" }
                )
            }
        },
        @{ name = "Content"; type = "multilineText" },
        @{ name = "Provider Message ID"; type = "singleLineText" },
        @{
            name = "Status"
            type = "singleSelect"
            options = @{
                choices = @(
                    @{ name = "Queued" },
                    @{ name = "Sent" },
                    @{ name = "Delivered" },
                    @{ name = "Failed" }
                )
            }
        },
        @{ name = "Timestamp"; type = "dateTime"; options = @{ timeZone = "utc"; dateFormat = @{ name = "iso" }; timeFormat = @{ name = "24hour" } } }
    )
}

Write-Host "Creating Conversations table..."
$response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables" -Headers $headers -Method Post -Body ($convosTable | ConvertTo-Json -Depth 10)
Write-Host "Conversations table created."

# 3. Create Follow-Up Tasks Table
$tasksTable = @{
    name = "Follow-Up Tasks"
    fields = @(
        @{ name = "Task Name"; type = "singleLineText" },
        @{ 
            name = "Lead"
            type = "multipleRecordLinks"
            options = @{
                linkedTableId = $leadsTableId
            }
        },
        @{ name = "Due At"; type = "dateTime"; options = @{ timeZone = "utc"; dateFormat = @{ name = "iso" }; timeFormat = @{ name = "24hour" } } },
        @{ name = "Reason"; type = "singleLineText" },
        @{ name = "Next Message Template"; type = "multilineText" },
        @{
            name = "Status"
            type = "singleSelect"
            options = @{
                choices = @(
                    @{ name = "Open" },
                    @{ name = "Done" },
                    @{ name = "Cancelled" }
                )
            }
        }
    )
}

Write-Host "Creating Follow-Up Tasks table..."
$response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables" -Headers $headers -Method Post -Body ($tasksTable | ConvertTo-Json -Depth 10)
Write-Host "Follow-Up Tasks table created."

# 4. Create Checkouts Table
$checkoutsTable = @{
    name = "Checkouts"
    fields = @(
        @{ name = "Checkout Title"; type = "singleLineText" },
        @{ 
            name = "Lead"
            type = "multipleRecordLinks"
            options = @{
                linkedTableId = $leadsTableId
            }
        },
        @{ name = "Stripe Checkout ID"; type = "singleLineText" },
        @{ name = "Amount"; type = "currency"; options = @{ symbol = "$"; precision = 2 } },
        @{
            name = "Status"
            type = "singleSelect"
            options = @{
                choices = @(
                    @{ name = "Pending" },
                    @{ name = "Complete" },
                    @{ name = "Expired" }
                )
            }
        }
    )
}

Write-Host "Creating Checkouts table..."
$response = Invoke-RestMethod -Uri "https://api.airtable.com/v0/meta/bases/$baseId/tables" -Headers $headers -Method Post -Body ($checkoutsTable | ConvertTo-Json -Depth 10)
Write-Host "Checkouts table created."

Write-Host "All Sales OS tables created successfully!"

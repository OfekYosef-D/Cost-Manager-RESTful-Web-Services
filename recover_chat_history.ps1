# Cursor Chat History Recovery Script
# This script helps recover chat history from an old workspace folder

$workspaceStorage = "$env:APPDATA\Cursor\User\workspaceStorage"

# Current workspace (CostManagerRESTful Web Services)
$currentWorkspace = "05b081ebd951dc1851cd69225658e1ab"

# Old workspace folders (likely candidates)
$oldWorkspaces = @{
    "6c1c803492cc306f6169d80c1bf2e21f" = "Final Project (292 KB)"
    "d2e98dec87fa21bbbcea2db0f1e3f309" = "Async-Cost-Manager-main (276 KB)"
}

Write-Host "================================================"
Write-Host "Cursor Chat History Recovery"
Write-Host "================================================"
Write-Host ""
Write-Host "Current workspace: $currentWorkspace"
Write-Host ""

# Check current state.vscdb
$currentDb = Join-Path (Join-Path $workspaceStorage $currentWorkspace) "state.vscdb"
if (Test-Path $currentDb) {
    $currentSize = (Get-Item $currentDb).Length
    Write-Host "Current chat history: $([math]::Round($currentSize/1KB, 2)) KB"
} else {
    Write-Host "Current chat history: Not found"
}
Write-Host ""

Write-Host "Available old workspace folders with chat history:"
foreach ($ws in $oldWorkspaces.GetEnumerator()) {
    $oldDb = Join-Path (Join-Path $workspaceStorage $ws.Key) "state.vscdb"
    if (Test-Path $oldDb) {
        $oldSize = (Get-Item $oldDb).Length
        Write-Host "  - $($ws.Value)"
        Write-Host "    Folder ID: $($ws.Key)"
        Write-Host "    Size: $([math]::Round($oldSize/1KB, 2)) KB"
    }
}
Write-Host ""

Write-Host "IMPORTANT: Before proceeding, make sure Cursor is CLOSED!"
Write-Host ""
$response = Read-Host "Do you want to copy chat history from an old workspace? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Which workspace do you want to copy from?"
    Write-Host "1. Final Project (6c1c803492cc306f6169d80c1bf2e21f)"
    Write-Host "2. Async-Cost-Manager-main (d2e98dec87fa21bbbcea2db0f1e3f309)"
    $choice = Read-Host "Enter 1 or 2"
    
    $sourceWorkspace = $null
    if ($choice -eq "1") {
        $sourceWorkspace = "6c1c803492cc306f6169d80c1bf2e21f"
    } elseif ($choice -eq "2") {
        $sourceWorkspace = "d2e98dec87fa21bbbcea2db0f1e3f309"
    } else {
        Write-Host "Invalid choice. Exiting."
        exit
    }
    
    # Backup current database
    if (Test-Path $currentDb) {
        $backupPath = "$currentDb.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $currentDb $backupPath
        Write-Host "Backed up current database to: $backupPath"
    }
    
    # Copy old database
    $sourceDb = Join-Path (Join-Path $workspaceStorage $sourceWorkspace) "state.vscdb"
    if (Test-Path $sourceDb) {
        Copy-Item $sourceDb $currentDb -Force
        Write-Host ""
        Write-Host "SUCCESS: Chat history copied from old workspace!"
        Write-Host "Source: $sourceWorkspace"
        Write-Host "Destination: $currentWorkspace"
        Write-Host ""
        Write-Host "Now restart Cursor and your old chat history should appear."
    } else {
        Write-Host "ERROR: Source database not found!"
    }
} else {
    Write-Host "Operation cancelled."
}

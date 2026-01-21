$workspaceStorage = "$env:APPDATA\Cursor\User\workspaceStorage"
$currentPath = "C:\Coding\Async Serverside course\CostManagerRESTful Web Services"

Write-Host "Searching for workspace folders related to your project..."
Write-Host "Current path: $currentPath"
Write-Host ""

Get-ChildItem $workspaceStorage | ForEach-Object {
    $wsFile = Join-Path $_.FullName "workspace.json"
    if (Test-Path $wsFile) {
        try {
            $content = Get-Content $wsFile -Raw | ConvertFrom-Json
            if ($content.folder) {
                if ($content.folder -match "CostManager|Async|Serverside") {
                    Write-Host "Found: $($_.Name)"
                    Write-Host "  Path: $($content.folder)"
                    Write-Host "  Last Modified: $($_.LastWriteTime)"
                    Write-Host ""
                }
            }
        } catch {
            # Skip if JSON parsing fails
        }
    }
}

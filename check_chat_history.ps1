$workspaceStorage = "$env:APPDATA\Cursor\User\workspaceStorage"
$folders = @(
    "05b081ebd951dc1851cd69225658e1ab",
    "6c1c803492cc306f6169d80c1bf2e21f",
    "d2e98dec87fa21bbbcea2db0f1e3f309"
)

Write-Host "Checking for chat history (state.vscdb) files..."
Write-Host ""

foreach ($f in $folders) {
    $dbPath = Join-Path (Join-Path $workspaceStorage $f) "state.vscdb"
    if (Test-Path $dbPath) {
        $size = (Get-Item $dbPath).Length
        $sizeKB = [math]::Round($size / 1KB, 2)
        Write-Host "$f : state.vscdb exists ($sizeKB KB)"
    } else {
        Write-Host "$f : No state.vscdb found"
    }
}

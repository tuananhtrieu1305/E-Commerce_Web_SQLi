# ============================================================
# DEMO SWITCHER
# Usage: .\switch-demo.ps1 secure
#        .\switch-demo.ps1 vulnerable
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("secure", "vulnerable", "s", "v")]
    [string]$Mode
)

if ($Mode -eq "s") { $Mode = "secure" }
if ($Mode -eq "v") { $Mode = "vulnerable" }

$envFile = Join-Path $PSScriptRoot ".env"
$content = Get-Content $envFile -Raw

if ($Mode -eq "secure") {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  SECURE MODE: WAF + LB + backend-secure" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan

    $content = $content -replace 'VITE_BACKEND_URL=.*', 'VITE_BACKEND_URL=http://localhost/api/secure'
    Set-Content $envFile $content -NoNewline

    Write-Host ""
    Write-Host "[OK] VITE_BACKEND_URL = http://localhost/api/secure" -ForegroundColor Green
    Write-Host "[->] Flow: Browser -> WAF(:80) -> LB -> backend-secure:8082" -ForegroundColor Gray

} else {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "  VULNERABLE MODE: NO WAF, NO LB" -ForegroundColor Red
    Write-Host "  Direct -> backend-vulnerable:8081" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red

    $content = $content -replace 'VITE_BACKEND_URL=.*', 'VITE_BACKEND_URL=http://localhost:8081'
    Set-Content $envFile $content -NoNewline

    Write-Host ""
    Write-Host "[OK] VITE_BACKEND_URL = http://localhost:8081" -ForegroundColor Yellow
    Write-Host "[->] Flow: Browser -> backend-vulnerable:8081 (DIRECT)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[*] Restarting frontend..." -ForegroundColor Yellow
docker compose up -d frontend --no-deps --force-recreate

Write-Host ""
if ($Mode -eq "secure") {
    Write-Host "[DONE] Open: http://localhost  (port 80, qua WAF)" -ForegroundColor Cyan
} else {
    Write-Host "[DONE] Open: http://localhost:5173  (bypass WAF)" -ForegroundColor Yellow
}
Write-Host "       Nho Ctrl+Shift+R de hard refresh browser!" -ForegroundColor White
Write-Host ""

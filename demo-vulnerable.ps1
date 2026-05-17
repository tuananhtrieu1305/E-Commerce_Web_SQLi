# ============================================================
# DEMO MODE: VULNERABLE
# Frontend -> TRỰC TIẾP backend-vulnerable:8081 (bypass WAF & LB)
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  SWITCHING TO: VULNERABLE MODE" -ForegroundColor Red
Write-Host "  NO WAF | NO Load Balancer" -ForegroundColor Red
Write-Host "  Direct -> backend-vulnerable:8081" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$envFile = ".env"
$content = Get-Content $envFile -Raw

# Thay VITE_BACKEND_URL
$content = $content -replace 'VITE_BACKEND_URL=.*', 'VITE_BACKEND_URL=http://localhost:8081'

Set-Content $envFile $content -NoNewline

Write-Host "[1/2] Updated .env: VITE_BACKEND_URL=http://localhost:8081" -ForegroundColor Green

# Restart frontend để inject URL mới (không cần rebuild)
Write-Host "[2/2] Restarting frontend container..." -ForegroundColor Yellow
docker compose up -d frontend --no-deps --force-recreate

Write-Host ""
Write-Host "⚠️  VULNERABLE MODE ACTIVE" -ForegroundColor Red
Write-Host ""
Write-Host "  Request flow:" -ForegroundColor White
Write-Host "  Browser --> http://localhost:8081 (NO WAF, NO LB) --> backend-vulnerable" -ForegroundColor Gray
Write-Host ""
Write-Host "  Open: http://localhost:5173  (or http://localhost)" -ForegroundColor Cyan
Write-Host "  NOTE: API calls go directly to :8081, bypassing all security layers" -ForegroundColor Yellow
Write-Host ""

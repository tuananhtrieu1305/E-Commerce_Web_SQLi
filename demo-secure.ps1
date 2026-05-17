# ============================================================
# DEMO MODE: SECURE
# Frontend -> WAF (reverse-proxy:80) -> Load Balancer -> backend-secure:8082
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SWITCHING TO: SECURE MODE" -ForegroundColor Cyan
Write-Host "  WAF + Load Balancer + backend-secure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env"
$content = Get-Content $envFile -Raw

# Thay VITE_BACKEND_URL
$content = $content -replace 'VITE_BACKEND_URL=.*', 'VITE_BACKEND_URL=http://localhost/api/secure'

Set-Content $envFile $content -NoNewline

Write-Host "[1/2] Updated .env: VITE_BACKEND_URL=http://localhost/api/secure" -ForegroundColor Green

# Restart frontend để inject URL mới (không cần rebuild)
Write-Host "[2/2] Restarting frontend container..." -ForegroundColor Yellow
docker compose up -d frontend --no-deps --force-recreate

Write-Host ""
Write-Host "✅ SECURE MODE ACTIVE" -ForegroundColor Green
Write-Host ""
Write-Host "  Request flow:" -ForegroundColor White
Write-Host "  Browser --> http://localhost (WAF) --> Load Balancer --> backend-secure:8082" -ForegroundColor Gray
Write-Host ""
Write-Host "  Open: http://localhost" -ForegroundColor Cyan
Write-Host ""

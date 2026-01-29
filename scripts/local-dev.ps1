# NEXGATE - Roda tudo em desenvolvimento (PowerShell)
# Uso: .\scripts\local-dev.ps1
# Ou execute os blocos um por um em terminais separados.

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "=== 1. Docker (Postgres + Redis) ===" -ForegroundColor Cyan
Set-Location $root
docker-compose up -d

Write-Host "`n=== 2. Backend (instalar, migrar, seed) ===" -ForegroundColor Cyan
Set-Location $backend
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
npm install
npm run build
npm run migrate:run
npm run seed

Write-Host "`n=== Pronto. Agora rode manualmente em 3 terminais: ===" -ForegroundColor Green
Write-Host "Terminal 1 - API:  cd backend; npm run start:dev" -ForegroundColor Yellow
Write-Host "Terminal 2 - Worker: cd backend; npm run worker:dev" -ForegroundColor Yellow
Write-Host "Terminal 3 - Frontend: cd frontend; npm install; npm run dev" -ForegroundColor Yellow
Write-Host "`nFrontend: http://localhost:3000 | API: http://localhost:4000/api" -ForegroundColor Green

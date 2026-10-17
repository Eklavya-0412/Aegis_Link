Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Aegis Link Healthcare Coordination Platform Launcher" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting FastAPI Backend Server (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; python -m uvicorn app.main:app --reload --port 8000"

Write-Host "Starting React Frontend Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; npm start"

Write-Host ""
Write-Host "Success! Both services are launching in background windows." -ForegroundColor Yellow
Write-Host "  - Backend API & Docs: http://localhost:8000/api/docs" -ForegroundColor Yellow
Write-Host "  - Frontend Application: http://localhost:3000" -ForegroundColor Yellow

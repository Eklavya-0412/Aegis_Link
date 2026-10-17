@echo off
title Aegis Link Platform Launcher
echo ===================================================
echo  Aegis Link Healthcare Coordination Platform
echo ===================================================
echo.
echo Launching FastAPI Backend on http://localhost:8000 ...
start "Aegis Link Backend (FastAPI)" cmd /c "%~dp0launch_backend.bat"

echo Launching React Frontend on http://localhost:3000 ...
start "Aegis Link Frontend (React)" cmd /c "%~dp0launch_frontend.bat"

echo.
echo Both servers are starting up!
echo   - Backend API Docs: http://localhost:8000/api/docs
echo   - Frontend Web App: http://localhost:3000
echo.
pause

@echo off
echo ===============================================
echo  Starting Aegis Link FastAPI Backend (Port 8000)
echo ===============================================
cd /d "%~dp0backend"
python -m uvicorn app.main:app --reload --port 8000
pause

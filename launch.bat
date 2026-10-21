@echo off
title Aegis Link Launcher
cd /d "%~dp0"
rem Runs both servers via launcher.py: checks ports and dependencies, waits until
rem the app responds, opens the browser, and stops everything cleanly on Ctrl+C.
rem Extra options are passed through, e.g.  launch.bat --no-browser
python launcher.py %*
pause

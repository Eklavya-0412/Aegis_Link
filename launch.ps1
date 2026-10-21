# Runs both servers via launcher.py: checks ports and dependencies, waits until
# the app responds, opens the browser, and stops everything cleanly on Ctrl+C.
# Extra options are passed through, e.g.  .\launch.ps1 --no-browser
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $rootDir
python launcher.py @args

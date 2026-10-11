@echo off
REM Double-click to set up and start FileSaviour (opens http://127.0.0.1:8000).
cd /d "%~dp0"
where py >nul 2>nul && (py -3 run.py %*) || (python run.py %*)
pause

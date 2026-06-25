@echo off
setlocal
cd /d "%~dp0"
echo Starting Mittare Sattahip Flask server...
echo.
echo Open these URLs in your browser:
echo   Main site:        http://127.0.0.1:5000/
echo   Agent dashboard:  http://127.0.0.1:5000/agent-dashboard.html
echo   Customer status:  http://127.0.0.1:5000/customer-status.html
echo.
echo Default test password: admin123
echo Press Ctrl+C to stop the server.
echo.
python app.py
pause

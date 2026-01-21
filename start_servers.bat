@echo off
echo ===================================================
echo Starting Multilingual Tweet Sentiment Analysis App
echo ===================================================

echo.
echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "python -m uvicorn backend.main:app --reload"

echo.
echo [2/3] Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo [3/3] Opening Application in Browser...
:: Wait a few seconds for servers to initialize
timeout /t 5 >nul
start http://localhost:5173

echo.
echo Done! Both servers are running in separate windows.
echo To stop them, close the windows or run stop_servers.bat
pause

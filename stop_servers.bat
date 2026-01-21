@echo off
echo ===================================================
echo Stopping Multilingual Tweet Sentiment Analysis App
echo ===================================================

echo.
echo Stopping Node.js (Frontend)...
taskkill /IM node.exe /F
echo.

echo Stopping Python/Uvicorn (Backend)...
taskkill /IM python.exe /F
:: Note: This kills all python processes. If you have others running, be careful.
:: tailored for this specific isolated usage.

echo.
echo All servers stopped.
pause

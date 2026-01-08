@echo off
echo.
echo ===================================================
echo   CAMSS JOB MATCHING APP - USB TETHERING MODE
echo ===================================================
echo.
echo Starting Expo with USB Tethering configuration...
echo Your IP: 192.168.250.249
echo.

cd /d C:\Dev\ai-job-matchingV2\frontend\jobmatch

echo [1/2] Checking if backend is running...
curl -s http://192.168.250.249:8000/docs >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] Backend not detected!
    echo.
    echo Please start backend first:
    echo    cd C:\Dev\ai-job-matchingV2\backend
    echo    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
    echo.
    pause
    exit /b 1
)

echo [OK] Backend is running!
echo.
echo [2/2] Starting Expo Metro with tunnel...
echo.

set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.250.249
call npm run start:usb

pause

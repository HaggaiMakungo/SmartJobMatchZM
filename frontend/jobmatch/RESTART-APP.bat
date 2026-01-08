@echo off
echo ========================================
echo RESTARTING JobMatch App
echo ========================================
echo.
echo This will:
echo   1. Stop the current Metro bundler
echo   2. Clear cache
echo   3. Restart with correct configuration
echo.
echo Press Ctrl+C in the Metro window first, then
pause
echo.
echo Starting with cleared cache...
echo.

cd /d C:\Dev\ai-job-matchingV2\frontend\jobmatch
npx expo start --lan --clear

echo.
echo ========================================
echo App restarted! Scan the QR code.
echo ========================================

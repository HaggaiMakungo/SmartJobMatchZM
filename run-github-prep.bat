@echo off
echo ========================================
echo   CAMSS 2.0 - GitHub Preparation
echo ========================================
echo.
echo Starting cleanup process...
echo.

REM Run PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -File "%~dp0prepare-for-github.ps1"

echo.
echo Process complete!
pause

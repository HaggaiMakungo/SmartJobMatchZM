@echo off
echo ========================================
echo Setting up Save Candidate Feature
echo ========================================
echo.

cd backend

echo Step 1: Creating saved_candidates table...
python create_saved_candidates_table.py

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create table
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete! ✅
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Go to Jobs page and click bookmark icons
echo 3. View saved candidates in Candidates page
echo.
pause

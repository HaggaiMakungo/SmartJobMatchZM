@echo off
REM Quick migration script for JobMatch mobile app (Windows)
REM Run this from the frontend\jobmatch directory

echo ========================================
echo  JobMatch Mobile - Quick Migration
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the frontend\jobmatch directory
    exit /b 1
)

echo [INFO] Current directory: %CD%
echo.

REM Step 1: Backup old files
echo [STEP 1] Backing up old service files...
if not exist ".backup" mkdir .backup
if exist "src\services\jobs.service.ts" (
    copy "src\services\jobs.service.ts" ".backup\jobs.service.ts.old" >nul
    echo   [OK] Backed up jobs.service.ts
) else (
    echo   [INFO] No old jobs.service.ts found
)

if exist "src\services\match.service.ts" (
    copy "src\services\match.service.ts" ".backup\match.service.ts.old" >nul
    echo   [OK] Backed up match.service.ts
) else (
    echo   [INFO] No old match.service.ts found
)

if exist "src\hooks\useJobs.ts" (
    copy "src\hooks\useJobs.ts" ".backup\useJobs.ts.old" >nul
    echo   [OK] Backed up useJobs.ts
) else (
    echo   [INFO] No old useJobs.ts found
)
echo   [OK] Backups saved to .backup\ folder
echo.

REM Step 2: Replace with new files
echo [STEP 2] Installing new service files...

if exist "src\services\jobs.service.new.ts" (
    copy "src\services\jobs.service.new.ts" "src\services\jobs.service.ts" >nul
    echo   [OK] jobs.service.ts updated
) else (
    echo   [WARN] jobs.service.new.ts not found
)

if exist "src\services\matching.service.new.ts" (
    copy "src\services\matching.service.new.ts" "src\services\match.service.ts" >nul
    echo   [OK] match.service.ts updated
) else (
    echo   [WARN] matching.service.new.ts not found
)

if exist "src\hooks\useJobs.new.ts" (
    copy "src\hooks\useJobs.new.ts" "src\hooks\useJobs.ts" >nul
    echo   [OK] useJobs.ts updated
) else (
    echo   [WARN] useJobs.new.ts not found
)
echo.

REM Step 3: Verify types file
echo [STEP 3] Verifying job types file...
if exist "src\types\jobs.ts" (
    echo   [OK] jobs.ts types file exists
) else (
    echo   [WARN] src\types\jobs.ts not found - you may need to create it
)
echo.

REM Step 4: Check backend
echo [STEP 4] Checking backend connection...
curl -s -o nul http://localhost:8000/docs 2>nul
if %errorlevel%==0 (
    echo   [OK] Backend is running at http://localhost:8000
) else (
    echo   [WARN] Backend doesn't seem to be running
    echo        Start it with: cd backend ^&^& python -m uvicorn app.main:app --reload
)
echo.

REM Summary
echo ========================================
echo  Migration Complete!
echo ========================================
echo.
echo [NEXT STEPS]
echo   1. Update your screen components to use new hooks
echo   2. Start the dev server: npx expo start
echo   3. Test with Brian Mwale login
echo   4. Check home screen, jobs screen, and job details
echo.
echo [DOCUMENTATION]
echo   * Full guide: MOBILE_APP_UPDATED.md
echo   * Types reference: src\types\jobs.ts
echo   * API docs: http://localhost:8000/docs
echo.
echo [ROLLBACK]
echo   To rollback: copy .backup\*.old src\services\ or src\hooks\
echo.
echo Made in Zambia [ZM Flag]
echo.
pause

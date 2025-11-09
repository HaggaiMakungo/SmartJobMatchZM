@echo off
REM ============================================================================
REM SmartJobMatchZM - Git Repository Initialization Script
REM ============================================================================
REM This script will:
REM 1. Initialize Git repository
REM 2. Configure Git settings
REM 3. Create initial commit
REM 4. Set up for GitHub connection
REM ============================================================================

echo.
echo ========================================
echo SmartJobMatchZM Git Setup
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/7] Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check if already initialized
if exist ".git" (
    echo [WARNING] Git repository already initialized!
    echo.
    choice /C YN /M "Do you want to reinitialize (this will keep your history)"
    if errorlevel 2 (
        echo Aborting...
        pause
        exit /b 0
    )
)

echo [2/7] Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to initialize Git repository
    pause
    exit /b 1
)
echo [SUCCESS] Repository initialized
echo.

echo [3/7] Configuring Git settings...
echo Please enter your GitHub username:
set /p GIT_USERNAME="Username: "

echo Please enter your GitHub email:
set /p GIT_EMAIL="Email: "

git config user.name "%GIT_USERNAME%"
git config user.email "%GIT_EMAIL%"

REM Optional: Set global configs if not set
git config --global core.autocrlf true
git config --global init.defaultBranch main

echo [SUCCESS] Git configured
echo   Username: %GIT_USERNAME%
echo   Email: %GIT_EMAIL%
echo.

echo [4/7] Checking files to be committed...
git status
echo.

echo [5/7] Adding all files to staging area...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)
echo [SUCCESS] Files staged
echo.

echo [6/7] Creating initial commit...
git commit -m "Initial commit: SmartJobMatchZM project setup with FastAPI backend and React frontend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create commit
    pause
    exit /b 1
)
echo [SUCCESS] Initial commit created
echo.

echo [7/7] Setting default branch to 'main'...
git branch -M main
echo [SUCCESS] Branch renamed to main
echo.

echo ========================================
echo Git Repository Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Create a new repository on GitHub:
echo    - Go to: https://github.com/new
echo    - Repository name: SmartJobMatchZM
echo    - Description: AI-Powered Job Matching Platform for Zambia
echo    - Keep it Public or Private (your choice)
echo    - DO NOT initialize with README, .gitignore, or license
echo    - Click 'Create repository'
echo.
echo 2. Connect to GitHub (run ONE of these commands):
echo.
echo    HTTPS (easier, will prompt for password):
echo    git remote add origin https://github.com/%GIT_USERNAME%/SmartJobMatchZM.git
echo.
echo    SSH (recommended if you have SSH keys set up):
echo    git remote add origin git@github.com:%GIT_USERNAME%/SmartJobMatchZM.git
echo.
echo 3. Push to GitHub:
echo    git push -u origin main
echo.
echo 4. Create develop branch (optional but recommended):
echo    git checkout -b develop
echo    git push -u origin develop
echo.
echo ========================================
echo.

REM Create a helper file with the exact commands
echo git remote add origin https://github.com/%GIT_USERNAME%/SmartJobMatchZM.git > github_setup_commands.txt
echo git push -u origin main >> github_setup_commands.txt
echo git checkout -b develop >> github_setup_commands.txt
echo git push -u origin develop >> github_setup_commands.txt

echo Commands saved to: github_setup_commands.txt
echo.

pause

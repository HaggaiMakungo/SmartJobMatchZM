@echo off
echo ========================================
echo JobMatch Backend Server
echo ========================================
echo.
echo Starting on: http://192.168.28.60:8000
echo API Docs: http://192.168.28.60:8000/docs
echo.
echo ========================================
echo.

cd /d "%~dp0"
conda activate base
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

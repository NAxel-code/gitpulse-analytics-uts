@echo off
echo ========================================================
echo   GitPulse Analytics — GitHub Developer Intelligence
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://localhost:8000 ...
start "GitPulse Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Next.js 15 Frontend on http://localhost:3000 ...
start "GitPulse Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo All services are launching!
echo Backend Swagger API Docs: http://localhost:8000/docs
echo Frontend Bento Dashboard: http://localhost:3000
echo ========================================================
pause

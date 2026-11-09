Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "  GitPulse Analytics — GitHub Developer Intelligence" -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Magenta

Write-Host "`n[1/2] Starting Python FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

Write-Host "[2/2] Starting Next.js 15 Frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nAll services have been launched!" -ForegroundColor Yellow
Write-Host "Backend Swagger API: http://localhost:8000/docs"
Write-Host "Frontend Bento Grid: http://localhost:3000"
Write-Host "========================================================" -ForegroundColor Magenta

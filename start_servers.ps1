# Start Backend
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -Command `"cd backend; .\venv\Scripts\activate; uvicorn main:app --reload`""

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit -Command `"`$env:PATH += ';C:\Program Files\nodejs'; cd frontend; npm.cmd run dev`""

Write-Host "Starting servers... "
Write-Host "Backend API will be available at http://127.0.0.1:8000"
Write-Host "Frontend will be available at http://localhost:5173"

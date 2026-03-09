$baseDir = $PSScriptRoot

Write-Host "Starting API Gateway (Port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend\api-gateway'; npm run dev"

Write-Host "Starting AI Brain Service (Port 5001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend\microservices\ai-brain'; python app.py"

Write-Host "Starting Cognitive Screener Service (Port 5002)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend\microservices\cognitive-screener'; python app.py"

Write-Host "Starting Frontend (Port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm start"

Write-Host "All services have been launched in separate windows!"
Write-Host "Please ensure you have configured the .env files before running this script."

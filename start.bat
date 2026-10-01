@echo off
rem Starts the Python backend and the website, each in its own window.
cd /d "%~dp0"

where python >nul 2>nul || (echo Python was not found. Install Python 3.12 and try again. & pause & exit /b 1)
where npm >nul 2>nul || (echo Node.js was not found. Install Node.js and try again. & pause & exit /b 1)

if not exist node_modules (
  echo Installing website packages, first run only...
  call npm install || (echo npm install failed. & pause & exit /b 1)
)

python -c "import flask, cv2, sklearn, pandas, tensorflow" >nul 2>nul || (
  echo Installing Python packages, first run only. This can take several minutes...
  python -m pip install -r server\requirements.txt || (echo pip install failed. & pause & exit /b 1)
)

echo Starting the backend at http://localhost:5000 ...
start "Biodiversity backend (Flask)" cmd /k "cd /d %~dp0server && python app.py"

echo Starting the website at http://localhost:5173 ...
start "Biodiversity website (Vite)" cmd /k "cd /d %~dp0 && npm run dev"

echo Opening the browser in 8 seconds. The first Identify can take a while while the model loads.
timeout /t 8 /nobreak >nul
start "" http://localhost:5173

echo.
echo Both servers are running in their own windows. Close those windows to stop them.

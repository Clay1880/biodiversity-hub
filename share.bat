@echo off
rem Starts the backend and website, then shares the website over a free Cloudflare tunnel (HTTPS link).
cd /d "%~dp0"

where python >nul 2>nul || (echo Python was not found. Install Python 3.12 and try again. & pause & exit /b 1)
where npm >nul 2>nul || (echo Node.js was not found. Install Node.js and try again. & pause & exit /b 1)
rem cloudflared may not be on PATH in a terminal opened before it was installed, so fall back to its install folder
where cloudflared >nul 2>nul && set "CF=cloudflared" || set "CF=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if /i not "%CF%"=="cloudflared" if not exist "%CF%" (
  echo cloudflared is not installed. Install it once with:
  echo     winget install Cloudflare.cloudflared
  echo Then run share.bat again.
  pause & exit /b 1
)

if not exist node_modules (
  echo Installing website packages, first run only...
  call npm install || (echo npm install failed. & pause & exit /b 1)
)
python -c "import flask, cv2, sklearn, pandas, tensorflow" >nul 2>nul || (
  echo Installing Python packages, first run only. This can take several minutes...
  python -m pip install -r server\requirements.txt || (echo pip install failed. & pause & exit /b 1)
)

echo Starting the backend...
start "Biodiversity backend (Flask)" cmd /k "cd /d %~dp0server && python app.py"

echo Starting the website (open to your network)...
start "Biodiversity website (Vite)" cmd /k "cd /d %~dp0 && npm run dev -- --host"

echo Waiting for the website to start...
timeout /t 8 /nobreak >nul

echo.
echo SAME WI-FI: on the other laptop open  http://YOUR-IP:5173   (your IP addresses are listed below)
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^(127|169)' } | ForEach-Object { '    ' + $_.IPAddress }"
echo.
echo ANYWHERE: the tunnel window shows a link like https://something.trycloudflare.com . Open that link on any device.
echo The link works only while this laptop and these windows stay open. Close all the windows to stop sharing.
echo.
start "Share link (Cloudflare tunnel)" cmd /k ""%CF%" tunnel --url http://localhost:5173"

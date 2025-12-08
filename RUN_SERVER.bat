@echo off
cls
echo ============================================
echo   STARTING FIFA CARD CREATOR SERVER
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo [2/3] Installing dependencies...
python -m pip install Flask flask-cors Pillow --quiet --disable-pip-version-check

echo.
echo [3/3] Starting server...
echo.
echo ============================================
echo   SERVER STARTING - DO NOT CLOSE THIS WINDOW
echo ============================================
echo.
echo Open your browser to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
echo ============================================
echo.

python web_server.py

echo.
echo Server stopped.
pause

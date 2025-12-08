@echo off
echo ========================================
echo  Starting FIFA Card Creator Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python...
python3 --version 2>nul
if %errorlevel% neq 0 (
    echo Python3 not found! Trying 'python' command...
    python --version 2>nul
    if %errorlevel% neq 0 (
        echo Trying 'py' command...
        py --version 2>nul
        if %errorlevel% neq 0 (
            echo ERROR: Python is not installed or not in PATH
            echo Please install Python from https://python.org
            pause
            exit /b 1
        )
        echo Starting server with 'py' command...
        py web_server.py
    ) else (
        echo Starting server with 'python' command...
        python web_server.py
    )
) else (
    echo Starting server with 'python3' command...
    python3 web_server.py
)

pause

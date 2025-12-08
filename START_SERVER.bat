@echo off
echo ====================================
echo FIFA Card Creator - Starting Server
echo ====================================
echo.
cd /d "%~dp0"
C:\ProgramData\chocolatey\bin\python3.13.exe web_server.py
pause

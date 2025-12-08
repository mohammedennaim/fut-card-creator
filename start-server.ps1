# FIFA Card Creator - Server Starter
# Run this script to start the server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting FIFA Card Creator Server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "📁 Working directory: $ScriptDir" -ForegroundColor Green
Write-Host ""

# Try to find Python
Write-Host "🔍 Looking for Python..." -ForegroundColor Yellow

$pythonCmd = $null

# Try python3 first
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
    Write-Host "✅ Found: python3" -ForegroundColor Green
}
# Try python
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
    Write-Host "✅ Found: python" -ForegroundColor Green
}
# Try py launcher
elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
    Write-Host "✅ Found: py launcher" -ForegroundColor Green
}
else {
    Write-Host "❌ ERROR: Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python from: https://python.org" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Show Python version
Write-Host ""
Write-Host "🐍 Python version:" -ForegroundColor Cyan
& $pythonCmd --version

Write-Host ""
Write-Host "🚀 Starting Flask server..." -ForegroundColor Yellow
Write-Host "📍 Server will run at: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
& $pythonCmd web_server.py

# If server stops
Write-Host ""
Write-Host "Server stopped." -ForegroundColor Red
Read-Host "Press Enter to exit"

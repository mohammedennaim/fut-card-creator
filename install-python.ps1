# Python Installer Helper Script
# This will help you install Python automatically

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FIFA Card Creator - Python Installer" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is already installed
$pythonInstalled = $false
try {
    $version = python --version 2>&1
    if ($version -match "Python \d+\.\d+\.\d+") {
        Write-Host "✅ Python is already installed: $version" -ForegroundColor Green
        $pythonInstalled = $true
    }
} catch {
    Write-Host "❌ Python is NOT installed" -ForegroundColor Red
}

if (-not $pythonInstalled) {
    Write-Host ""
    Write-Host "🔍 Checking for winget (Windows Package Manager)..." -ForegroundColor Yellow
    
    $wingetAvailable = Get-Command winget -ErrorAction SilentlyContinue
    
    if ($wingetAvailable) {
        Write-Host "✅ winget is available!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📦 Installing Python 3.12 via winget..." -ForegroundColor Yellow
        Write-Host "⏳ This may take a few minutes..." -ForegroundColor Cyan
        Write-Host ""
        
        winget install Python.Python.3.12 --silent
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Python installed successfully!" -ForegroundColor Green
            Write-Host "⚠️  Please CLOSE and REOPEN PowerShell for changes to take effect" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Then run this command to start the server:" -ForegroundColor Cyan
            Write-Host "    python web_server.py" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Installation failed. Please try manual installation:" -ForegroundColor Red
            Write-Host "   https://www.python.org/downloads/" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ winget is not available" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 MANUAL INSTALLATION REQUIRED:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Open your web browser" -ForegroundColor Cyan
        Write-Host "2. Go to: https://www.python.org/downloads/" -ForegroundColor White
        Write-Host "3. Click the big yellow 'Download Python' button" -ForegroundColor Cyan
        Write-Host "4. Run the downloaded installer" -ForegroundColor Cyan
        Write-Host "5. ⚠️  IMPORTANT: Check ✅ 'Add Python to PATH'" -ForegroundColor Yellow
        Write-Host "6. Click 'Install Now'" -ForegroundColor Cyan
        Write-Host "7. Wait for installation to complete" -ForegroundColor Cyan
        Write-Host "8. Close and reopen PowerShell" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Press any key to open Python download page in browser..." -ForegroundColor Green
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Start-Process "https://www.python.org/downloads/"
    }
} else {
    Write-Host ""
    Write-Host "🎉 Python is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Installing required packages..." -ForegroundColor Yellow
    
    python -m pip install --upgrade pip --quiet
    python -m pip install Flask flask-cors Pillow --quiet
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can now start the server with:" -ForegroundColor Cyan
    Write-Host "    python web_server.py" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Do you want to start the server now? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host ""
        Write-Host "🚀 Starting server..." -ForegroundColor Green
        python web_server.py
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"

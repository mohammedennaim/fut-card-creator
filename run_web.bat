@echo off
echo ====================================
echo    FIFA Card Creator - Web Interface
echo    واجهة الويب لمنشئ بطاقات FIFA
echo ====================================
echo.

REM Check if Flask is installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo [!] Flask not installed. Installing...
    echo [!] Flask غير مثبت. جاري التثبيت...
    python -m pip install flask flask-cors
    echo.
)

REM Start the web server
echo [*] Starting web server...
echo [*] تشغيل سيرفر الويب...
echo.
echo ====================================
echo 🌐 Server URL: http://localhost:5000
echo ====================================
echo.
echo ✅ Open your browser and go to:
echo    http://localhost:5000
echo.
echo ✅ افتح المتصفح واذهب إلى:
echo    http://localhost:5000
echo.
echo Press CTRL+C to stop the server
echo اضغط CTRL+C لإيقاف السيرفر
echo ====================================
echo.

python web_server.py

pause

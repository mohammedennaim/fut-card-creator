@echo off
echo ====================================
echo    FIFA Card Creator - Demo
echo    منشئ بطاقات FIFA - نسخة تجريبية
echo ====================================
echo.

REM تثبيت المكتبات المطلوبة
echo [1/2] تثبيت المكتبات المطلوبة...
echo [1/2] Installing required libraries...
python -m pip install -r requirements.txt

echo.
echo [2/2] تشغيل البرنامج...
echo [2/2] Running the program...
echo.

REM تشغيل الملف التجريبي
python demo.py

echo.
echo ====================================
pause

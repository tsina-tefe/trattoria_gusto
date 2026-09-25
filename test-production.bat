@echo off
echo ========================================
echo Testing Production Build Setup
echo ========================================
echo.

echo Checking if build files exist...
if exist "public\build\manifest.json" (
    echo [OK] Vite manifest.json found
) else (
    echo [ERROR] Vite manifest.json NOT found
)

if exist "public\build\manifest.webmanifest" (
    echo [OK] PWA manifest.webmanifest found
) else (
    echo [ERROR] PWA manifest.webmanifest NOT found
)

if exist "public\build\sw.js" (
    echo [OK] Service Worker found
) else (
    echo [ERROR] Service Worker NOT found
)

echo.
echo Clearing Laravel caches...
call php artisan optimize:clear
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure your Laravel server is running: php artisan serve
echo 2. Open browser to: http://127.0.0.1:8000
echo 3. Press Ctrl+F5 to force refresh
echo.
pause

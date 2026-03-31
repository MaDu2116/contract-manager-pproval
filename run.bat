@echo off
echo ============================================
echo   Contract Management System
echo ============================================
echo.
echo Stopping old containers (if any)...
docker compose -f docker-compose.prod.yml down 2>nul
echo.
echo Building and starting services (first run may take 2-3 minutes)...
docker compose -f docker-compose.prod.yml up -d --build

echo.
echo ============================================
echo   Application is starting...
echo   Please wait ~15 seconds for initialization.
echo.
echo   Open in browser: http://localhost:3001
echo.
echo   Default accounts:
echo   admin@company.com / admin123 (Manager)
echo   legal@company.com / legal123 (Legal Admin)
echo   viewer@company.com / viewer123 (Viewer)
echo ============================================
echo.
echo To stop: docker compose -f docker-compose.prod.yml down
echo To view logs: docker compose -f docker-compose.prod.yml logs -f app
pause

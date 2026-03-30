@echo off
echo ============================================
echo   Contract Management System
echo ============================================
echo.
echo Pulling latest images...
docker compose -f docker-compose.prod.yml pull

echo.
echo Starting services...
docker compose -f docker-compose.prod.yml up -d

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

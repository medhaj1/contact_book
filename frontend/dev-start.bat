@echo off
echo 🚀 Starting Contact Book Development Server with Hot Reload...
echo.

REM Navigate to frontend directory
cd /d %~dp0

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.dev.yml down

REM Build and start with hot reload
echo 🔨 Building and starting development container...
docker-compose -f docker-compose.dev.yml up --build --force-recreate

echo.
echo ✅ Development server should be running at: http://localhost:3000
echo 🔥 Hot reload is enabled - your changes will be reflected automatically!
echo 🎨 All styles and assets should be properly mounted!
echo.
echo To stop: Press Ctrl+C or run 'docker-compose -f docker-compose.dev.yml down'
pause

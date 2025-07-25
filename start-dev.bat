@echo off
echo Starting CampusLink Development Environment...
echo.

echo Starting MongoDB (make sure MongoDB is installed and running)
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd Backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend" cmd /k "cd Frontend && npm run dev"

echo.
echo ✅ Development servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul
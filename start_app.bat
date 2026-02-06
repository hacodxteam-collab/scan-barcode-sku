@echo off
echo Starting SKU Barcode Scanner App...

:: Start Backend
start "SKU Backend" cmd /k "cd server && npm start"

:: Start Frontend
start "SKU Frontend" cmd /k "cd client && npm run dev"

echo App is launching...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
pause

@echo off
echo Installing Server Dependencies...
cd server
call npm install
echo.
echo Dependencies installed!
echo You can now close this window and run "start_app.bat" again.
pause

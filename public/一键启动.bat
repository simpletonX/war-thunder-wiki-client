@echo off
cd /d %~dp0

start "" caddy_windows_amd64.exe run --config Caddyfile

:waitloop
netstat -ano | findstr ":5175" >nul
if errorlevel 1 (
    timeout /t 1 >nul
    goto waitloop
)

start http://localhost:5175

pause
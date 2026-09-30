@echo off
REM ==============================================================================
REM GAGANDRISHTI: 1-CLICK WINDOWS BATCH GITHUB SYNCHRONIZER
REM ==============================================================================
echo ==========================================================
echo 🌾 GaganDrishti: Syncing Antigravity with GitHub
echo ==========================================================

set MSG=%~1
if "%MSG%"=="" set MSG="feat: automated sync from Antigravity to GitHub"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-github.ps1" -CommitMessage %MSG%

echo.
pause

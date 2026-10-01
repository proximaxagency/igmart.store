@echo off
title Pushing IGMART to GitHub Production
echo ========================================================
echo   Pushing production changes to GitHub: proximaxagency/igmart.store
echo ========================================================
echo.
set "PATH=C:\Users\harshdeep\AppData\Local\Programs\Git\cmd;C:\Users\harshdeep\AppData\Local\Programs\Git\mingw64\bin;%PATH%"
set "GCM_CREDENTIAL_STORE=wincredman"
cd /d "%~dp0"
git config --global credential.helper manager
git config --global credential.credentialStore wincredman
git add -A
git commit -m "fix: listing ReferenceError crash and sync game visibility across devices via server API"
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   [SUCCESS] Changes pushed to GitHub successfully!
    echo   Vercel is now deploying your production release.
    echo ========================================================
) else (
    echo ========================================================
    echo   [ERROR] Push encountered an issue. Check message above.
    echo ========================================================
)
echo.
pause

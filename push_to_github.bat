@echo off
title Pushing IGMART to GitHub Production
echo ========================================================
echo   Pushing production changes to GitHub: proximaxagency/igmart.store
echo ========================================================
echo.
set "PATH=C:\Users\harshdeep\AppData\Local\Programs\Git\cmd;C:\Users\harshdeep\AppData\Local\Programs\Git\mingw64\bin;%PATH%"
set "GCM_CREDENTIAL_STORE=wincredman"
cd /d "C:\Users\harshdeep\Desktop\igmart.store-main"
git config --global credential.helper manager
git config --global credential.credentialStore wincredman
git push -u origin main --force
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

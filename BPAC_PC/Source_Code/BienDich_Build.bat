@echo off
chcp 65001 >nul
title TRINH BIEN DICH BPAC - ENQ
cd /d "%~dp0"
echo ============================================================
echo   TRINH BIEN DICH MA NGUON C# BPAC VA AUTOUPDATE (ENQ)
echo ============================================================
echo.

set CSC=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo [LOI] Khong tim thay trinh bien dich csc.exe cua Windows .NET Framework!
    pause
    exit /b 1
)

echo [1/2] Dang bien dich autoupdate.exe tu AutoUpdateService.cs...
"%CSC%" /target:winexe /optimize+ /out:..\autoupdate.exe AutoUpdateService.cs
if %errorlevel% neq 0 (
    echo [LOI] Bien dich autoupdate.exe that bai!
    pause
    exit /b 1
)
echo      -^> Da tao thanh cong: BPAC_PC\autoupdate.exe
echo.

echo [2/2] Dang bien dich BPAC.exe (Tich hop co che Tu phuc hoi Self-Healing)...
"%CSC%" /target:winexe /optimize+ /resource:..\autoupdate.exe,autoupdate.exe /out:..\BPAC.exe BPAC_Launcher.cs
if %errorlevel% neq 0 (
    echo [LOI] Bien dich BPAC.exe that bai!
    pause
    exit /b 1
)
echo      -^> Da tao thanh cong: BPAC_PC\BPAC.exe (Da nhung kem autoupdate.exe ben trong)
echo.

echo ============================================================
echo   BIEN DICH HOAN TAT THANH CONG 100%!
echo   BPAC.exe gio day co kha nang TU HOI SINH autoupdate.exe neu bi xoa!
echo ============================================================
echo.
pause

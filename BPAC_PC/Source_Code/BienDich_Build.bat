@echo off
chcp 65001 >nul
echo ============================================================
echo   TRÌNH BIÊN DỊCH MÃ NGUỒN C# BPAC VÀ AUTOUPDATE (ENQ)
echo ============================================================
echo.

set CSC=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe

if not exist "%CSC%" (
    set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe
)

if not exist "%CSC%" (
    echo [LỖI] Không tìm thấy trình biên dịch csc.exe của Windows .NET Framework!
    pause
    exit /b 1
)

echo [1/2] Đang biên dịch BPAC.exe từ BPAC_Launcher.cs...
"%CSC%" /target:winexe /optimize+ /out:..\BPAC.exe BPAC_Launcher.cs
if %errorlevel% neq 0 (
    echo [LỖI] Biên dịch BPAC.exe thất bại!
    pause
    exit /b 1
)
echo      -> Đã tạo thành công: BPAC_PC\BPAC.exe

echo [2/2] Đang biên dịch autoupdate.exe từ AutoUpdateService.cs...
"%CSC%" /target:winexe /optimize+ /out:..\autoupdate.exe AutoUpdateService.cs
if %errorlevel% neq 0 (
    echo [LỖI] Biên dịch autoupdate.exe thất bại!
    pause
    exit /b 1
)
echo      -> Đã tạo thành công: BPAC_PC\autoupdate.exe

echo.
echo ============================================================
echo   BIÊN DỊCH HOÀN TẤT THÀNH CÔNG 100%!
echo   Các file .exe đã được xuất tại thư mục: BPAC_PC\
echo ============================================================
echo.
pause

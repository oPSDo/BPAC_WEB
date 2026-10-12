using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace BPACAutoUpdate
{
    // Cau hinh mac dinh duoc nhung thang ben trong ma nguon de tranh nguoi van hanh tu y sua file
    class Config
    {
        // 1. Dia chi Cloud Server (Render / Domain cua cong ty)
        public string ServerUrl = "https://tram-tron-net.onrender.com";
        // 2. Khoa bao mat API noi bo giua Tram va Server
        public string ApiKey = "BPAC_SECRET_KEY_2026";
        // 3. Thu muc luu du lieu mac dinh cua phan mem Siemens BPAC tren may tram
        public string DataDir = @"D:\BPAC_2026RT\LuuDL_BPAC";
        // 4. Chu ky tu dong quet va upload (giay)
        public int IntervalSeconds = 15;
        // 5. Ten/Ma dinh danh tram tron nay (vd: tram_1 hoac Tram Asphalt ENQ 01)
        public string StationName = "tram_1";
    }

    static class Program
    {
        private static Mutex _appMutex;
        private static string _appDir;
        private static string _logFile;
        private static string _cacheFile;
        private static Config _config = new Config();
        private static Dictionary<string, string> _syncedFiles = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        [STAThread]
        static void Main()
        {
            try
            {
                // Kiem tra tien trinh dang chay (Fallback cuc ky tin cay tren moi ban Windows)
                Process currentProc = Process.GetCurrentProcess();
                Process[] procs = Process.GetProcessesByName(currentProc.ProcessName);
                if (procs.Length > 1)
                {
                    return; // Da co tien trinh chay
                }

                bool createdNew = false;
                try
                {
                    _appMutex = new Mutex(true, "BPAC_AutoUpdate_Mutex", out createdNew);
                    if (!createdNew) return;
                }
                catch { }

                _appDir = AppDomain.CurrentDomain.BaseDirectory;
                _logFile = Path.Combine(_appDir, "autoupdate.log");
                _cacheFile = Path.Combine(_appDir, "sync_cache.txt");

                // Thiet lap giao thuc bao mat SSL/TLS hien dai
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)192 | (SecurityProtocolType)768 | (SecurityProtocolType)3072; // SSL3, TLS1.0, TLS1.1, TLS1.2
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                Log("=== BPAC AutoUpdate Service Started (Hardcoded Config Mode) ===");
                Log("Target Server: " + _config.ServerUrl);
                Log("Station ID: " + _config.StationName);
                Log("Data Folder: " + _config.DataDir);

                LoadCache();

                // Vong lap giam sat va dong bo dinh ky
                while (true)
                {
                    try
                    {
                        if (HasInternetConnection())
                        {
                            SyncAllFiles();
                        }
                        else
                        {
                            Log("No internet connection or server unreachable. Waiting for network...");
                        }
                    }
                    catch (Exception ex)
                    {
                        Log("Error during sync cycle: " + ex.Message);
                    }

                    int sleepMs = Math.Max(5, _config.IntervalSeconds) * 1000;
                    Thread.Sleep(sleepMs);
                }
            }
            catch (Exception ex)
            {
                Log("Fatal error: " + ex.ToString());
            }
            finally
            {
                if (_appMutex != null)
                {
                    _appMutex.ReleaseMutex();
                    _appMutex.Close();
                }
            }
        }

        private static void LoadCache()
        {
            try
            {
                if (File.Exists(_cacheFile))
                {
                    string[] lines = File.ReadAllLines(_cacheFile, Encoding.UTF8);
                    foreach (string line in lines)
                    {
                        if (string.IsNullOrEmpty(line)) continue;
                        string[] parts = line.Split('|');
                        if (parts.Length == 2)
                        {
                            _syncedFiles[parts[0]] = parts[1];
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log("Error loading cache: " + ex.Message);
            }
        }

        private static void SaveCacheEntry(string relPath, string signature)
        {
            try
            {
                _syncedFiles[relPath] = signature;
                File.AppendAllText(_cacheFile, relPath + "|" + signature + "\r\n", Encoding.UTF8);
            }
            catch { }
        }

        private static bool HasInternetConnection()
        {
            try
            {
                // Thu kiem tra ServerUrl truoc
                string target = _config.ServerUrl;
                if (!string.IsNullOrEmpty(target) && (target.StartsWith("http://") || target.StartsWith("https://")))
                {
                    HttpWebRequest req = (HttpWebRequest)WebRequest.Create(target + "/api/ping");
                    req.Method = "GET";
                    req.Timeout = 5000;
                    using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                    {
                        return res.StatusCode == HttpStatusCode.OK;
                    }
                }

                // Kiem tra du phong bang Google DNS / Cloudflare
                using (var client = new WebClient())
                {
                    using (client.OpenRead("http://clients3.google.com/generate_204"))
                    {
                        return true;
                    }
                }
            }
            catch
            {
                // Thu tiep neu loi
                try
                {
                    using (var client = new WebClient())
                    {
                        using (client.OpenRead("http://www.msftconnecttest.com/connecttest.txt"))
                        {
                            return true;
                        }
                    }
                }
                catch
                {
                    return false;
                }
            }
        }

        private static void SyncAllFiles()
        {
            string root = _config.DataDir;
            if (!Directory.Exists(root))
            {
                Log("DataDir not found: " + root);
                return;
            }

            // Quet cac thu muc theo ngay hoac file truc tiep
            DirectoryInfo rootDir = new DirectoryInfo(root);
            FileInfo[] allFiles = rootDir.GetFiles("*.*", SearchOption.AllDirectories);

            int uploadCount = 0;
            foreach (FileInfo fi in allFiles)
            {
                string ext = fi.Extension.ToLowerInvariant();
                if (ext != ".xls" && ext != ".pdf")
                {
                    continue; // Chi dong bo bao cao Excel va PDF
                }

                string relPath = fi.FullName.Substring(root.Length).TrimStart('\\', '/');
                string currentSig = fi.Length + "_" + fi.LastWriteTimeUtc.Ticks;

                string cachedSig;
                if (_syncedFiles.TryGetValue(relPath, out cachedSig))
                {
                    if (cachedSig == currentSig)
                    {
                        continue; // File da duoc upload va chua bi sua doi
                    }
                }

                // Kiem tra xem file co dang bi WinCC ghi dở khong
                if (IsFileLocked(fi.FullName))
                {
                    // File dang bi khoa, bo qua cho lan sau
                    continue;
                }

                // Tien hanh Upload file len Server
                bool success = UploadFileToServer(fi, relPath);
                if (success)
                {
                    SaveCacheEntry(relPath, currentSig);
                    uploadCount++;
                }
            }

            if (uploadCount > 0)
            {
                Log(string.Format("Sync completed: Uploaded {0} file(s).", uploadCount));
            }
        }

        private static bool IsFileLocked(string filePath)
        {
            FileStream stream = null;
            try
            {
                stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                return false;
            }
            catch (IOException)
            {
                return true;
            }
            finally
            {
                if (stream != null)
                {
                    stream.Close();
                }
            }
        }

        private static bool UploadFileToServer(FileInfo fi, string relPath)
        {
            try
            {
                string boundary = "---------------------------" + DateTime.Now.Ticks.ToString("x");
                byte[] boundaryBytes = Encoding.ASCII.GetBytes("\r\n--" + boundary + "\r\n");

                string uploadUrl = _config.ServerUrl.TrimEnd('/') + "/api/upload";
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(uploadUrl);
                req.Method = "POST";
                req.ContentType = "multipart/form-data; boundary=" + boundary;
                req.KeepAlive = true;
                req.Timeout = 30000;
                req.Headers.Add("X-API-Key", _config.ApiKey);

                // Thu muc cha la ngay (vd 2026_10_09)
                string folder = Path.GetDirectoryName(relPath).Replace('\\', '/');
                if (string.IsNullOrEmpty(folder)) folder = "root";

                using (Stream requestStream = req.GetRequestStream())
                {
                    // 1. Field: station
                    WriteFormField(requestStream, boundaryBytes, "station", _config.StationName);

                    // 2. Field: folder
                    WriteFormField(requestStream, boundaryBytes, "folder", folder);

                    // 3. Field: filename
                    WriteFormField(requestStream, boundaryBytes, "relpath", relPath.Replace('\\', '/'));

                    // 4. File data
                    string headerTemplate = "\r\n--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{0}\"\r\nContent-Type: application/octet-stream\r\n\r\n";
                    string header = string.Format(headerTemplate, fi.Name);
                    byte[] headerBytes = Encoding.UTF8.GetBytes(header);
                    requestStream.Write(headerBytes, 0, headerBytes.Length);

                    using (FileStream fileStream = new FileStream(fi.FullName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                    {
                        byte[] buffer = new byte[8192];
                        int bytesRead;
                        while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) > 0)
                        {
                            requestStream.Write(buffer, 0, bytesRead);
                        }
                    }

                    byte[] trailer = Encoding.ASCII.GetBytes("\r\n--" + boundary + "--\r\n");
                    requestStream.Write(trailer, 0, trailer.Length);
                }

                using (HttpWebResponse response = (HttpWebResponse)req.GetResponse())
                {
                    if (response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.Created)
                    {
                        Log(string.Format("Uploaded: {0} ({1} bytes)", relPath, fi.Length));
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Log(string.Format("Failed to upload {0}: {1}", relPath, ex.Message));
            }

            return false;
        }

        private static void WriteFormField(Stream s, byte[] boundary, string name, string val)
        {
            s.Write(boundary, 0, boundary.Length);
            string formItem = string.Format("Content-Disposition: form-data; name=\"{0}\"\r\n\r\n{1}", name, val);
            byte[] bytes = Encoding.UTF8.GetBytes(formItem);
            s.Write(bytes, 0, bytes.Length);
        }

        private static void Log(string msg)
        {
            try
            {
                string line = string.Format("[{0:yyyy-MM-dd HH:mm:ss}] {1}\r\n", DateTime.Now, msg);
                File.AppendAllText(_logFile, line, Encoding.UTF8);

                // Tu dong don dep log neu vuot qua 5MB
                FileInfo fi = new FileInfo(_logFile);
                if (fi.Length > 5 * 1024 * 1024)
                {
                    string oldLog = Path.Combine(_appDir, "autoupdate_old.log");
                    if (File.Exists(oldLog)) File.Delete(oldLog);
                    File.Move(_logFile, oldLog);
                }
            }
            catch { }
        }
    }
}

================================================================================
  BỘ MÃ NGUỒN C# PHẦN MỀM MÁY TRẠM: BPAC.exe VÀ AUTOUPDATE.exe
  CÔNG TY TNHH THIẾT BỊ CÔNG TRÌNH VIỆT NAM (ENQ)
================================================================================

1. CẤU TRÚC THƯ MỤC:
   ├── AutoUpdateService.cs    : Mã nguồn C# đầy đủ của autoupdate.exe (Dịch vụ đồng bộ)
   ├── BPAC_Launcher.cs        : Mã nguồn C# của BPAC.exe (Bộ khởi chạy kép)
   ├── BienDich_Build.bat      : Tệp lệnh biên dịch tự động 1-click thành file .EXE
   └── README_MA_NGUON.txt     : Hướng dẫn này

2. NGUYÊN LÝ HOẠT ĐỘNG:

   A) BPAC.exe (BPAC_Launcher.cs):
      - Đóng vai trò là file chạy chính trên Desktop của trạm trộn.
      - Khi người vận hành bấm mở "BPAC.exe":
        1. Chương trình kiểm tra và tự động khởi động "autoupdate.exe" ở chế độ chạy ngầm
           (Hidden - không hiện cửa sổ dòng lệnh để tránh người dùng tắt nhầm).
        2. Đồng thời mở dự án SCADA trạm trộn Siemens WinCC Runtime ("pdata.fwc").
      - Nhờ đó, người vận hành trạm chỉ cần mở 1 biểu tượng duy nhất, hệ thống tự động
        chạy cả SCADA trộn và dịch vụ đồng bộ lên Web.

   B) autoupdate.exe (AutoUpdateService.cs):
      - Chạy ngầm trong hệ thống, chống chạy trùng lặp qua Mutex.
      - CẤU HÌNH NHÚNG TRỰC TIẾP TRONG MÃ NGUỒN (KHÔNG DÙNG FILE CẤU HÌNH BÊN NGOÀI):
        Để đảm bảo an toàn tuyệt đối, ngăn người vận hành trạm tự ý sửa đổi làm gián đoạn
        dữ liệu lên server, toàn bộ thông số (ServerUrl, ApiKey, DataDir, StationName, IntervalSeconds)
        đã được nhúng tĩnh và biên dịch thẳng vào file nhị phân `autoupdate.exe`.
      - Cứ sau mỗi chu kỳ (15 giây), chương trình quét thư mục lưu dữ liệu của trạm trộn
        (D:\BPAC_2026RT\LuuDL_BPAC).
      - Cơ chế chống đọc file dở (File-Lock Check): Nếu WinCC đang xuất báo cáo dở (chưa ghi xong),
        chương trình tự động đợi mẻ trộn hoàn tất, tránh đọc file lỗi.
      - Cơ chế Cache thông minh (sync_cache.txt): Chỉ gửi các file mới tạo hoặc vừa cập nhật,
        không bao giờ gửi lặp lại các file cũ, tiết kiệm tối đa băng thông 4G/Internet của trạm.
      - Gửi dữ liệu an toàn qua giao thức HTTPS POST Multipart/form-data kèm mã trạm (StationName)
        và khóa bí mật (API Key) lên Web Server.
      - Tự động ghi nhật ký chi tiết vào autoupdate.log, tự động dọn dẹp log khi vượt quá 5MB.

3. HƯỚNG DẪN BIÊN DỊCH (BUILD RA FILE .EXE):
   - Bạn KHÔNG cần cài đặt Visual Studio nặng nề.
   - Trên bất kỳ máy tính Windows nào (Windows 7/8/10/11), chỉ cần nhấp đúp chuột vào:
       --> BienDich_Build.bat <--
   - Script sẽ tự động gọi trình biên dịch csc.exe tích hợp sẵn của Windows .NET Framework
     và tạo ra ngay lập tức:
       + BPAC_PC\BPAC.exe
       + BPAC_PC\autoupdate.exe

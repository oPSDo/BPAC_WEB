========================================================================================
            HỆ THỐNG ĐIỀU HÀNH & GIÁM SÁT TRẠM TRỘN BÊ TÔNG BPAC - FUTA01
              (TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU SIEMENS SCADA LÊN CLOUD WEB MONITORING)
========================================================================================

ĐỊA CHỈ TRUY CẬP GIÁM SÁT TỪ XA:
- Website: https://tramtron.bot-keep.xyz
- Tài khoản: admindemo
- Mật khẩu: 123456 (hoặc 123456@)

CẤU TRÚC TOÀN BỘ CÁC THÀNH PHẦN TRÊN GOOGLE DRIVE (N:\My Drive\Dev\ENQ\TramTron_Web\):

1. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ:
   - Bao_Cao_He_Thong_BPAC_TramTron.docx  -> File Word phân tích kiến trúc & vận hành
   - Bao_Cao_He_Thong_BPAC_TramTron.pdf   -> File PDF phân tích kiến trúc & vận hành

2. TOÀN BỘ CHƯƠNG TRÌNH MÁY TRẠM SIEMENS:
   - Thư mục BPAC_2026RT\
     + pdata.fwc                          -> File chạy chính Siemens WinCC Flexible Runtime
     + BPAC.exe                           -> File thực thi 1-Click (tự chạy Siemens + ngầm sync)
     + autoupdate.exe                     -> Tiến trình ngầm tự động nhận diện và upload
     + autoupdate_config.json             -> Cấu hình kết nối tới https://tramtron.bot-keep.xyz
     + Tao_Shortcut_Desktop.bat           -> Tạo biểu tượng ra Desktop máy trạm
     + LuuDL_BPAC\                        -> Thư mục lưu dữ liệu theo ngày (nam_thang_ngay)
       * Ghi_CaXe_...xls (Excel từng mẻ / chuyến xe xuất xưởng)
       * Ghi_CT Ngày_...xls (Excel tổng kết các mẻ trong ngày)
       * In_CaXe_...pdf (Phiếu in giao hàng)

3. BỘ CÀI ĐẶT NHANH CHO MÁY TRẠM:
   - Thư mục Client_Tools\               -> Chứa BPAC.exe, autoupdate.exe, autoupdate_config.json

4. TOÀN BỘ MÃ NGUỒN WEB CLOUD:
   - app.js, package.json, .env, Procfile
   - services/
     + excelParser.js                     -> Bộ bóc tách Excel thông minh (.xls)
     + dataStore.js                       -> Lưu trữ và tính toán 4 khối KPI realtime
   - routes/
     + api.js                             -> POST /api/upload (tiếp nhận file từ máy trạm)
     + auth.js                            -> Đăng nhập, phân quyền
     + dashboard.js                       -> 8 phân hệ (Trang chính, Công thức, Khách, Xe...)
   - views/                               -> Toàn bộ giao diện chuẩn theo thiết kế FUTA01
   - public/css/app.css                   -> Giao diện chuẩn
   - tramtron_web_botkeep.zip             -> Gói nén để upload lên máy chủ Cloud

QUY TRÌNH VẬN HÀNH 1-CLICK TẠI TRẠM:
1. Thợ trạm nhấp đúp vào biểu tượng "BPAC Tram Tron" trên màn hình Desktop.
2. Chương trình tự động mở SCADA Siemens (pdata.fwc) để điều khiển trạm.
3. Tiến trình autoupdate.exe tự động chạy ngầm, giám sát thư mục LuuDL_BPAC.
4. Mỗi khi trạm trộn xuất phiếu:
   - File Excel (.xls) và PDF lập tức được đẩy tự động lên https://tramtron.bot-keep.xyz
   - Lãnh đạo, kế toán, khách hàng mở điện thoại xem ngay số liệu thời gian thực!
========================================================================================

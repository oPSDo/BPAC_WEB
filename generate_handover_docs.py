import os
import sys
import codecs

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

print("Bắt đầu khởi tạo tài liệu bàn giao...")

# ==============================================================================
# PHẦN 1: TẠO TÀI LIỆU MICROSOFT WORD (.DOCX)
# ==============================================================================
def create_word_document(docx_path):
    doc = Document()
    
    # Thiết lập lề 2cm
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Helper set cell shading
    def set_cell_shading(cell, color_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    # Helper set cell borders
    def set_cell_padding(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    # TIÊU ĐỀ CHÍNH
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("TÀI LIỆU QUY HOẠCH & BÀN GIAO DỰ ÁN\nHỆ THỐNG GIÁM SÁT TRẠM TRỘN ASPHALT ENQ 01")
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(13, 71, 161) # Deep Blue

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Đơn vị: CÔNG TY TNHH THIẾT BỊ CÔNG TRÌNH VIỆT NAM\nPhiên bản bàn giao: 2.0 (Chạy thật & Quản lý toàn diện) | Ngày: 12/10/2026")
    sub_run.font.name = 'Arial'
    sub_run.font.size = Pt(11)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(108, 117, 125)

    doc.add_paragraph() # Spacer

    # Helper thêm heading
    def add_custom_heading(text, level=1):
        h = doc.add_paragraph()
        run = h.add_run(text)
        run.font.name = 'Arial'
        run.font.bold = True
        if level == 1:
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(13, 71, 161)
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(4)
        elif level == 2:
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(21, 101, 192)
            h.paragraph_format.space_before = Pt(10)
            h.paragraph_format.space_after = Pt(3)
        return h

    # Helper thêm paragraph
    def add_p(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            b_run = p.add_run(bold_prefix)
            b_run.font.name = 'Arial'
            b_run.font.bold = True
            b_run.font.size = Pt(10.5)
            b_run.font.color.rgb = RGBColor(33, 37, 41)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10.5)
        run.font.italic = italic
        run.font.color.rgb = RGBColor(33, 37, 41)
        return p

    # Helper Callout Box
    def add_callout(text, title="LƯU Ý QUAN TRỌNG"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.8)
        cell = tbl.cell(0, 0)
        set_cell_shading(cell, "E3F2FD") # Light Blue
        set_cell_padding(cell, 120, 120, 180, 180)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_t = p.add_run(f"📌 {title}: ")
        r_t.font.name = 'Arial'
        r_t.font.bold = True
        r_t.font.size = Pt(10)
        r_t.font.color.rgb = RGBColor(13, 71, 161)
        r_c = p.add_run(text)
        r_c.font.name = 'Arial'
        r_c.font.size = Pt(10)
        doc.add_paragraph()

    # MỤC 1
    add_custom_heading("1. TỔNG QUAN KIẾN TRÚC & MỤC TIÊU HỆ THỐNG", 1)
    add_p("Hệ thống phần mềm giám sát trạm trộn bê tông nhựa nóng Asphalt (ENQ 01) được xây dựng nhằm mục đích tự động hóa 100% quy trình thu thập số liệu mẻ trộn, chuyến xe từ máy tính điều khiển công nghiệp (Siemens WinCC) và truyền phát trực tiếp lên Cloud Web Dashboard.")
    add_p("Ban giám đốc và kỹ sư điều hành có thể theo dõi sản lượng, khối lượng mẻ, thành phần cốt liệu, nhựa đường, phụ gia theo thời gian thực từ điện thoại hoặc máy tính cá nhân ở bất cứ đâu.")
    
    add_p("• Trạm sản xuất: ", "Trạm Trộn Asphalt ENQ 01")
    add_p("• Đơn vị chủ quản: ", "CÔNG TY TNHH THIẾT BỊ CÔNG TRÌNH VIỆT NAM")
    add_p("• Địa chỉ máy chủ Cloud: ", "https://tram-tron-net.onrender.com")
    add_p("• Tài khoản quản trị mặc định: ", "admin / 123456")
    add_p("• Kho lưu trữ GitHub: ", "https://github.com/oPSDo/BPAC_WEB (Local: C:\\Users\\Admin\\Documents\\GitHub\\oPSDo\\BPAC_WEB)")
    # MỤC ĐẶC THÙ CÔNG NGHỆ BÊ TÔNG NHỰA
    add_custom_heading("★ ĐẶC THÙ CÔNG NGHỆ: TRẠM BÊ TÔNG NHỰA NÓNG (ASPHALT) KHÔNG PHẢI BÊ TÔNG XI MĂNG", 1)
    add_callout(
        "Dự án này phục vụ độc quyền cho TRẠM TRỘN BÊ TÔNG NHỰA NÓNG ASPHALT (ENQ 01). "
        "Tuyệt đối không nhầm lẫn với trạm bê tông xi măng (bê tông tươi thương phẩm). "
        "Toàn bộ thuật ngữ, quy trình điều khiển và chỉ số kỹ thuật đều tuân theo tiêu chuẩn bê tông nhựa nóng TCVN 8819:2011.",
        "LƯU Ý CỐT LÕI CỦA DỰ ÁN"
    )
    add_p("1. Chất liên kết (Binder): ", "Dùng Nhựa đường đặc Asphalt 60/70 (Bitumen) được gia nhiệt nóng chảy ở 150°C - 165°C. TUYỆT ĐỐI KHÔNG DÙNG XI MĂNG VÀ KHÔNG DÙNG NƯỚC.")
    add_p("2. Cốt liệu khoáng (Aggregates): ", "Gồm các cỡ đá dăm (Đá 10-20, Đá 5-10, Đá mạt 0-5) và cát xay được sấy khô, nung nóng trong tang sấy ở 160°C - 180°C trước khi đưa lên tháp trộn.")
    add_p("3. Bột khoáng (Mineral Filler): ", "Bột đá vôi nghiền mịn lọt sàng 0.075mm (ký hiệu PG-F hoặc Filler) đóng vai trò chất độn tăng độ đặc chắc, tăng diện tích tiếp xúc với nhựa đường.")
    add_p("4. Phụ gia Polyme (Additives): ", "Phụ gia biến tính SBS hoặc phụ gia tăng bám dính nhằm nâng cao độ ổn định nhiệt và chống lún vệt bánh xe của mặt đường.")
    add_p("5. Mác bê tông nhựa: ", "Các cấp phối mác chuẩn gồm BTNC 9.5 (thảm mặt mịn), BTNC 12.5 (mặt đường phổ thông), BTNC 19 (lớp mặt dưới), BTNR 19/25 (bê tông nhựa rỗng làm móng) và bê tông nhựa Polyme.")
    add_p("6. Đơn vị tính & Quy đổi: ", "Toàn bộ thành phần được cân điện tử theo khối lượng (Kg / Tấn). Thể tích thảm quy đổi m³ tính theo tỷ trọng đầm lèn thiết kế γ ≈ 2.400 kg/m³ (hoặc 2.4 Tấn/m³).")

    # MỤC 2
    add_custom_heading("2. QUY HOẠCH CẤU TRÚC THƯ MỤC CHUẨN", 1)
    add_p("Toàn bộ không gian làm việc của dự án được quy hoạch phân chia rõ ràng làm 3 phân vùng độc lập, tránh nhầm lẫn giữa tool máy trạm và mã nguồn web:")

    # Table Thư mục
    tbl_dirs = doc.add_table(rows=1, cols=3)
    tbl_dirs.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_dirs.autofit = False
    tbl_dirs.columns[0].width = Inches(1.8)
    tbl_dirs.columns[1].width = Inches(2.2)
    tbl_dirs.columns[2].width = Inches(2.8)

    hdr = tbl_dirs.rows[0].cells
    hdr[0].text = "Thư mục / Phân vùng"
    hdr[1].text = "Nhiệm vụ chính"
    hdr[2].text = "Ghi chú & Tệp tin trọng yếu"
    for c in hdr:
        set_cell_shading(c, "0D47A1")
        set_cell_padding(c, 100, 100, 120, 120)
        for r in c.paragraphs[0].runs:
            r.font.name = 'Arial'
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(10)

    dir_rows = [
        ("BPAC_PC/", "Bộ cài đặt & Chạy tự động máy trạm", "Chứa autoupdate.exe, BPAC.exe, autoupdate_config.json, file zip đóng gói BPAC_CaiDat_MayThat.zip"),
        ("ENQ_WEB/ (BPAC_WEB)", "Toàn bộ mã nguồn Web Server Node.js", "Chứa server.js, app.js, routes/, views/, public/, data/, services/ để deploy lên Render"),
        ("Other/", "Tài nguyên lưu trữ & File mẫu", "Chứa các file Excel gốc, thư mục OLD, tài liệu kỹ thuật không đẩy lên git web"),
        ("├── data/", "Kho dữ liệu JSON bền vững", "production_data.json (dữ liệu thật), macs.json, customers.json, vehicles.json"),
        ("├── services/", "Logic nghiệp vụ & Bóc tách", "excelParser.js (phân tích file WinCC), dataStore.js (CRUD & thống kê KPI)"),
        ("├── routes/", "Tuyến đường API & Điều hướng", "api.js (tiếp nhận upload/ping/reset), dashboard.js (render giao diện & CRUD)"),
        ("├── views/", "Giao diện EJS", "home.ejs, macs.ejs, customers.ejs, vehicles.ejs, phieus.ejs..."),
        ("└── public/css/", "Tài nguyên tĩnh", "app.css (chuẩn màu sắc, bảng 3 cột, responsive mobile, modal popup)")
    ]

    for item in dir_rows:
        row = tbl_dirs.add_row().cells
        row[0].text = item[0]
        row[1].text = item[1]
        row[2].text = item[2]
        for i, c in enumerate(row):
            set_cell_padding(c, 80, 80, 100, 100)
            if item[0].startswith("├──") or item[0].startswith("└──"):
                set_cell_shading(c, "F8F9FA")
            for r in c.paragraphs[0].runs:
                r.font.name = 'Arial'
                r.font.size = Pt(9.5)

    doc.add_paragraph()

    # MỤC 3
    add_custom_heading("3. LUỒNG HOẠT ĐỘNG DỮ LIỆU TỰ ĐỘNG (WORKFLOW)", 1)
    add_p("Hệ thống vận hành theo quy trình khép kín tự động 100%:")
    add_p("1. Máy trộn xả mẻ: ", "Phần mềm WinCC trạm trộn xuất file Excel theo ca hoặc xe vào thư mục cấu hình (ví dụ: D:\\BPAC_2026RT\\LuuDL_BPAC\\2026_10_12\\Ghi_CaXe_...xls hoặc Ghi_CTXe_...xls).")
    add_p("2. AutoUpdate Agent: ", "File autoupdate.exe chạy nền, cứ 15 giây quét thư mục LuuDL_BPAC một lần. Khi phát hiện file mới, tiến hành gửi HTTP POST Multipart lên máy chủ https://tram-tron-net.onrender.com/api/upload kèm API Key BPAC_SECRET_KEY_2026.")
    add_p("3. Bóc tách chuyên dụng Asphalt: ", "Tại server, module excelParser.js bóc tách dữ liệu mẻ: Cốt liệu 1-5, Phụ gia bột đá PG-F, PG-D, SBS, Nhựa đường Asphalt, Khối lượng tổng, Thể tích m³, Tên mác, Biển số xe, Khách hàng. Loại bỏ hoàn toàn xi măng và nước.")
    add_p("4. Cập nhật Real-time: ", "Hàm addOrder() trong dataStore.js ghi chuyến xe mới vào production_data.json, tự động cộng dồn 4 thẻ KPI trong ngày và tính bảng Xếp hạng khách hàng.")
    add_p("5. Giám sát tức thì: ", "Màn hình web /home và /phieus cập nhật dữ liệu. Khi có chuyến xe mới, người xem chỉ cần tải lại hoặc xem thông tin cập nhật trực tiếp.")

    add_callout("Module bóc tách file excelParser.js đã được chuẩn hóa để đọc đúng 100% dữ liệu từ trạm thật, loại bỏ hoàn toàn các chuỗi demo cũ (như 'FUTA', 'Thợ trạm', '89A-304.63', 'nước 180'). Mọi số liệu trên web phản ánh chính xác nội dung file xuất từ trạm.", "BẢO ĐẢM DỮ LIỆU THẬT")

    # MỤC 4
    add_custom_heading("4. CÁC TÍNH NĂNG ĐÃ HOÀN TẤT & ĐIỂM NỔI BẬT", 1)
    add_p("• Quản lý Công thức trộn (/macs): ", "Hỗ trợ đầy đủ Thêm / Sửa / Xóa modal popup theo đúng giao diện ảnh mẫu của trạm. Bố cục 2 cột input khoa học, chỉ gồm các thành phần cốt liệu và phụ gia asphalt, có bộ lọc tìm kiếm tức thì.")
    add_p("• Quản lý Khách hàng (/customers): ", "Hỗ trợ Thêm / Sửa / Xóa modal popup gồm: Mã KH, Tên khách hàng, MST, Đại diện, Người liên hệ, SĐT, Email, Địa chỉ, Số TK, Ngân hàng, NV KD, Tích lũy, Ghi chú.")
    add_p("• Quản lý Đội xe (/vehicles): ", "Hỗ trợ Thêm / Sửa / Xóa modal popup gồm: Mã LX (tự động gợi ý tăng), Tên lái xe, Biển số xe, SĐT, Thông tin đội xe.")
    add_p("• Bảng điều khiển trang chủ (/home): ", "4 thẻ KPI thống kê trong ngày, Bảng Sản lượng khách hàng cố định 3 cột chuẩn đẹp không tràn viền, Bảng Đơn hàng mới nhất có ô tìm kiếm.")
    add_p("• Báo cáo theo phiếu (/phieus): ", "100% dữ liệu thực tế từ các chuyến xe, không còn phiếu demo cũ, bộ lọc tìm kiếm theo số phiếu và khách hàng.")
    add_p("• Nút Reset dữ liệu ngày: ", "Nút màu đỏ trên đầu trang chủ và endpoint /api/reset-data cho phép xóa dữ liệu cũ về 0 bất kỳ lúc nào để bắt đầu ca sản xuất mới.")
    add_p("• Responsive Mobile: ", "Thiết kế tương thích mượt mà trên iPhone, Android, iPad, PC; chống tràn viền ngang (overflow-x: hidden).")

    # MỤC 5
    add_custom_heading("5. HƯỚNG DẪN CÀI ĐẶT & TIẾP TỤC PHÁT TRIỂN KHI VỀ NHÀ", 1)
    add_p("Khi anh về nhà, anh có thể tiếp tục mở và phát triển dự án theo các bước sau:")
    
    add_p("Bước 1: Cài đặt công cụ nền tảng trên máy nhà", "5.1. ")
    add_p("• Cài đặt Node.js (phiên bản 18 hoặc 20 LTS trở lên) từ https://nodejs.org")
    add_p("• Cài đặt Git từ https://git-scm.com và GitHub Desktop từ https://desktop.github.com")
    add_p("• Cài đặt trình soạn thảo VSCode hoặc Cursor.")

    add_p("Bước 2: Lấy mã nguồn về máy tính cá nhân", "5.2. ")
    add_p("• Cách 1 (Khuyên dùng qua GitHub): Mở GitHub Desktop -> Chọn Clone Repository -> Chọn repo oPSDo/BPAC_WEB hoặc nhập URL https://github.com/oPSDo/BPAC_WEB -> Chọn thư mục lưu trên máy nhà.")
    add_p("• Cách 2 (Qua Google Drive): Copy toàn bộ thư mục M:\\My Drive\\Dev\\ENQ\\TramTron_Web\\ENQ_WEB về máy nhà.")

    add_p("Bước 3: Cài đặt thư viện & Chạy thử nghiệm Local", "5.3. ")
    add_p("Mở Command Prompt hoặc Terminal trong thư mục dự án trên máy nhà và chạy các lệnh sau:")
    add_p("   cd BPAC_WEB\n   npm install\n   npm start", italic=True)
    add_p("Truy cập trình duyệt tại địa chỉ: http://localhost:36322 (hoặc http://localhost:3000 tùy port cấu hình). Đăng nhập với tài khoản: admin / 123456.")

    add_p("Bước 4: Quy trình Sửa đổi & Đẩy lên Cloud (Render)", "5.4. ")
    add_p("• Chỉnh sửa file mã nguồn theo ý muốn trên VSCode.")
    add_p("• Mở GitHub Desktop, sẽ thấy các file vừa chỉnh sửa xuất hiện trong danh sách Changes.")
    add_p("• Nhập tiêu đề commit (Summary), bấm Commit to main.")
    add_p("• Bấm nút Push origin (mũi tên hướng lên).")
    add_p("• Cloud Render (kết nối trực tiếp với GitHub) sẽ tự động kích hoạt Build & Deploy. Sau khoảng 1-2 phút, web tại https://tram-tron-net.onrender.com sẽ cập nhật bản mới nhất!")

    # MỤC 6
    add_custom_heading("6. KẾ HOẠCH & ĐỊNH HƯỚNG MỞ RỘNG (ROADMAP)", 1)
    add_p("1. Nâng cấp cơ sở dữ liệu: ", "Khi số lượng chuyến xe đạt hàng ngàn chuyến sau nhiều tháng, có thể chuyển từ JSON sang cơ sở dữ liệu phân tán (PostgreSQL trên Supabase / Neon hoặc MySQL cloud).")
    add_p("2. Xuất báo cáo Excel / PDF: ", "Thêm nút bấm 'Xuất Excel báo cáo tháng' cho phòng kế toán ngay trên giao diện web.")
    add_p("3. Biểu đồ trực quan: ", "Tích hợp thư viện Chart.js hiển thị biểu đồ cột sản lượng theo giờ và biểu đồ tròn tỷ lệ mác bê tông.")
    add_p("4. Phân quyền tài khoản: ", "Tách quyền 'Ban Giám Đốc' (chỉ xem báo cáo) và 'Quản Đốc Trạm' (được chỉnh sửa công thức và xóa đơn).")

    # Lưu file Word
    doc.save(docx_path)
    print(f"Đã tạo thành công file Word: {docx_path}")

# ==============================================================================
# PHẦN 2: TẠO TÀI LIỆU PDF CHUẨN IN ẤN QUA REPORTLAB
# ==============================================================================
def create_pdf_document(pdf_path):
    # Đăng ký font tiếng Việt Arial
    font_path = "C:\\Windows\\Fonts\\arial.ttf"
    font_bold_path = "C:\\Windows\\Fonts\\arialbd.ttf"
    font_italic_path = "C:\\Windows\\Fonts\\ariali.ttf"

    pdfmetrics.registerFont(TTFont('Arial', font_path))
    if os.path.exists(font_bold_path):
        pdfmetrics.registerFont(TTFont('Arial-Bold', font_bold_path))
    else:
        pdfmetrics.registerFont(TTFont('Arial-Bold', font_path))
    if os.path.exists(font_italic_path):
        pdfmetrics.registerFont(TTFont('Arial-Italic', font_italic_path))
    else:
        pdfmetrics.registerFont(TTFont('Arial-Italic', font_path))

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0D47A1'),
        alignment=1, # Center
        spaceAfter=6
    )

    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Arial-Italic',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#6C757D'),
        alignment=1,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'DocH1',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0D47A1'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1565C0'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#212529'),
        spaceAfter=4
    )

    body_bold_style = ParagraphStyle(
        'DocBodyBold',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#212529'),
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E3A8A'),
        backColor=colors.HexColor('#F1F5F9'),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#E0F2FE'),
        borderPadding=8,
        spaceBefore=6,
        spaceAfter=8
    )

    story = []

    # Tiêu đề
    story.append(Paragraph("TÀI LIỆU QUY HOẠCH & BÀN GIAO DỰ ÁN<br/>HỆ THỐNG GIÁM SÁT TRẠM TRỘN ASPHALT ENQ 01", title_style))
    story.append(Paragraph("CÔNG TY TNHH THIẾT BỊ CÔNG TRÌNH VIỆT NAM<br/>Phiên bản bàn giao: 2.0 (Chạy thật & Quản lý toàn diện) | Ngày 12/10/2026", sub_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0D47A1'), spaceBefore=0, spaceAfter=10))

    # 1. Tổng quan
    story.append(Paragraph("1. TỔNG QUAN KIẾN TRÚC & MỤC TIÊU HỆ THỐNG", h1_style))
    story.append(Paragraph("Hệ thống phần mềm giám sát trạm trộn bê tông nhựa nóng Asphalt (ENQ 01) được xây dựng nhằm mục đích tự động hóa 100% quy trình thu thập số liệu mẻ trộn, chuyến xe từ máy tính điều khiển công nghiệp (Siemens WinCC) và truyền phát trực tiếp lên Cloud Web Dashboard.", body_style))
    story.append(Paragraph("Ban giám đốc và kỹ sư điều hành có thể theo dõi sản lượng, khối lượng mẻ, thành phần cốt liệu, nhựa đường, phụ gia theo thời gian thực từ điện thoại hoặc máy tính cá nhân ở bất cứ đâu.", body_style))
    story.append(Paragraph("<b>• Trạm sản xuất:</b> Trạm Trộn Asphalt ENQ 01", body_style))
    story.append(Paragraph("<b>• Đơn vị chủ quản:</b> CÔNG TY TNHH THIẾT BỊ CÔNG TRÌNH VIỆT NAM", body_style))
    story.append(Paragraph("<b>• Địa chỉ máy chủ Cloud:</b> https://tram-tron-net.onrender.com", body_style))
    story.append(Paragraph("<b>• Tài khoản quản trị mặc định:</b> admin / 123456", body_style))
    story.append(Paragraph("<b>• Sao lưu Google Drive:</b> M:\\My Drive\\Dev\\ENQ\\TramTron_Web\\ENQ_WEB", body_style))

    # ĐẶC THÙ CÔNG NGHỆ BÊ TÔNG NHỰA
    story.append(Paragraph("★ ĐẶC THÙ CÔNG NGHỆ: TRẠM BÊ TÔNG NHỰA NÓNG (ASPHALT) KHÔNG PHẢI BÊ TÔNG XI MĂNG", h1_style))
    story.append(Paragraph("<b>LƯU Ý CỐT LÕI:</b> Dự án này phục vụ độc quyền cho TRẠM TRỘN BÊ TÔNG NHỰA NÓNG ASPHALT. Tuyệt đối không nhầm lẫn với trạm bê tông xi măng (bê tông tươi thương phẩm). Toàn bộ công nghệ tuân theo tiêu chuẩn TCVN 8819:2011:", callout_style))
    story.append(Paragraph("<b>1. Chất liên kết (Binder):</b> Dùng Nhựa đường đặc Asphalt 60/70 (Bitumen) được gia nhiệt nóng chảy ở 150°C - 165°C. <b>TUYỆT ĐỐI KHÔNG DÙNG XI MĂNG VÀ KHÔNG DÙNG NƯỚC.</b>", body_style))
    story.append(Paragraph("<b>2. Cốt liệu khoáng (Aggregates):</b> Gồm các cỡ đá dăm (Đá 10-20, Đá 5-10, Đá mạt 0-5) và cát xay được sấy khô, nung nóng trong tang sấy ở 160°C - 180°C trước khi trộn.", body_style))
    story.append(Paragraph("<b>3. Bột khoáng (Filler):</b> Bột đá vôi nghiền mịn lọt sàng 0.075mm đóng vai trò chất độn tăng độ đặc chắc và bám dính nhựa.", body_style))
    story.append(Paragraph("<b>4. Phụ gia Polyme (SBS):</b> Phụ gia biến tính SBS nâng cao độ ổn định nhiệt và chống lún vệt bánh xe của mặt đường.", body_style))
    story.append(Paragraph("<b>5. Mác bê tông nhựa:</b> Cấp phối mác chuẩn gồm BTNC 9.5, BTNC 12.5, BTNC 19, BTNR 19, C14, C19... (không phải mác M250, M300 của xi măng).", body_style))
    story.append(Paragraph("<b>6. Đơn vị tính:</b> Cân điện tử theo khối lượng (Kg / Tấn). Thể tích thảm quy đổi m³ tính theo tỷ trọng đầm lèn γ ≈ 2.400 kg/m³.", body_style))

    # 2. Quy hoạch thư mục
    story.append(Paragraph("2. QUY HOẠCH CẤU TRÚC THƯ MỤC CHUẨN", h1_style))
    story.append(Paragraph("Toàn bộ không gian làm việc của dự án được quy hoạch phân chia rõ ràng làm 3 phân vùng độc lập, tránh nhầm lẫn giữa tool máy trạm và mã nguồn web:", body_style))

    # Bảng thư mục PDF
    table_data = [
        [Paragraph("<b>Thư mục / Phân vùng</b>", body_style), Paragraph("<b>Nhiệm vụ chính</b>", body_style), Paragraph("<b>Ghi chú & Tệp tin trọng yếu</b>", body_style)],
        [Paragraph("<b>BPAC_PC/</b>", body_style), Paragraph("Tool chạy tự động máy trạm", body_style), Paragraph("autoupdate.exe, BPAC.exe, autoupdate_config.json, zip cài đặt", body_style)],
        [Paragraph("<b>ENQ_WEB/</b>", body_style), Paragraph("Mã nguồn Web App Node.js", body_style), Paragraph("server.js, app.js, routes/, views/, services/ để deploy Render", body_style)],
        [Paragraph("<b>Other/</b>", body_style), Paragraph("Tài nguyên & File mẫu", body_style), Paragraph("File Excel mẫu, thư mục OLD, tài liệu kỹ thuật phụ", body_style)],
        [Paragraph("├── <b>data/</b>", body_style), Paragraph("Kho dữ liệu JSON bền vững", body_style), Paragraph("production_data.json, macs.json, customers.json, vehicles.json", body_style)],
        [Paragraph("├── <b>services/</b>", body_style), Paragraph("Logic nghiệp vụ & Bóc tách", body_style), Paragraph("excelParser.js (phân tích WinCC), dataStore.js (CRUD & KPI)", body_style)],
        [Paragraph("├── <b>routes/</b>", body_style), Paragraph("Tuyến đường API & Web", body_style), Paragraph("api.js (upload/ping/reset), dashboard.js (render & CRUD)", body_style)],
        [Paragraph("└── <b>views/</b>", body_style), Paragraph("Giao diện EJS", body_style), Paragraph("home.ejs, macs.ejs, customers.ejs, vehicles.ejs, phieus.ejs", body_style)]
    ]

    t = Table(table_data, colWidths=[130, 160, 220])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0D47A1')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CED4DA')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#F8FAFC')),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # 3. Luồng tự động
    story.append(Paragraph("3. LUỒNG HOẠT ĐỘNG DỮ LIỆU TỰ ĐỘNG (WORKFLOW)", h1_style))
    story.append(Paragraph("<b>1. Máy trộn xả mẻ:</b> WinCC trạm trộn xuất file Excel theo ca hoặc xe vào thư mục cấu hình (ví dụ: D:\\BPAC_2026RT\\LuuDL_BPAC\\2026_10_12\\Ghi_CaXe_...xls hoặc Ghi_CTXe_...xls).", body_style))
    story.append(Paragraph("<b>2. AutoUpdate Agent:</b> File autoupdate.exe chạy nền, cứ 15 giây quét thư mục LuuDL_BPAC một lần. Khi phát hiện file mới, tự động gửi HTTP POST Multipart lên https://tram-tron-net.onrender.com/api/upload kèm API Key BPAC_SECRET_KEY_2026.", body_style))
    story.append(Paragraph("<b>3. Bóc tách chuyên dụng Asphalt:</b> Server gọi excelParser.js bóc tách: Cốt liệu 1-5, Phụ gia bột đá PG-F, PG-D, SBS, Nhựa đường Asphalt, Khối lượng tổng, Thể tích m³, Tên mác, Biển số xe, Khách hàng. Loại bỏ hoàn toàn xi măng và nước.", body_style))
    story.append(Paragraph("<b>4. Cập nhật Real-time:</b> Hàm addOrder() trong dataStore.js ghi chuyến xe mới vào production_data.json, tự động cộng dồn 4 thẻ KPI trong ngày và tính bảng Xếp hạng khách hàng.", body_style))
    story.append(Paragraph("<b>5. Giám sát tức thì:</b> Màn hình web /home và /phieus cập nhật dữ liệu. Khi có chuyến xe mới, người xem chỉ cần tải lại hoặc xem thông tin cập nhật trực tiếp.", body_style))

    story.append(Paragraph("📌 <b>BẢO ĐẢM DỮ LIỆU THẬT:</b> Module bóc tách file excelParser.js đã được chuẩn hóa để đọc đúng 100% dữ liệu từ trạm thật, loại bỏ hoàn toàn các chuỗi demo cũ (như 'FUTA', 'Thợ trạm', '89A-304.63', 'nước 180'). Mọi số liệu trên web phản ánh chính xác nội dung file xuất từ trạm.", callout_style))

    # 4. Tính năng đã hoàn tất
    story.append(Paragraph("4. CÁC TÍNH NĂNG ĐÃ HOÀN TẤT & ĐIỂM NỔI BẬT", h1_style))
    story.append(Paragraph("• <b>Quản lý Công thức trộn (/macs):</b> Hỗ trợ đầy đủ Thêm / Sửa / Xóa modal popup theo chuẩn Asphalt (không xi măng, không nước), tìm kiếm real-time.", body_style))
    story.append(Paragraph("• <b>Quản lý Khách hàng (/customers):</b> Hỗ trợ Thêm / Sửa / Xóa modal popup đầy đủ trường thông tin (Mã KH, Tên, MST, SĐT, Địa chỉ, Tài khoản, Tích lũy...), tìm kiếm real-time.", body_style))
    story.append(Paragraph("• <b>Quản lý Đội xe (/vehicles):</b> Hỗ trợ Thêm / Sửa / Xóa modal popup, tự động tăng mã lái xe, tìm kiếm real-time.", body_style))
    story.append(Paragraph("• <b>Bảng điều khiển trang chủ (/home):</b> 4 thẻ KPI động, bảng Top khách hàng chuẩn 3 cột không tràn viền, bảng Đơn hàng mới nhất có ô tìm kiếm.", body_style))
    story.append(Paragraph("• <b>Báo cáo theo phiếu (/phieus):</b> 100% dữ liệu thực tế từ trạm, không còn phiếu demo cũ, bộ lọc tìm kiếm theo số phiếu và khách hàng.", body_style))
    story.append(Paragraph("• <b>Nút Reset dữ liệu ngày:</b> Nút màu đỏ trên trang chủ và endpoint /api/reset-data cho phép xóa dữ liệu cũ về 0 bất kỳ lúc nào để bắt đầu ca sản xuất mới.", body_style))
    story.append(Paragraph("• <b>Responsive Mobile:</b> Tương thích mượt mà trên iPhone, Android, iPad, PC; chống tràn viền ngang.", body_style))

    # 5. Hướng dẫn về nhà
    story.append(Paragraph("5. HƯỚNG DẪN CÀI ĐẶT & TIẾP TỤC PHÁT TRIỂN KHI VỀ NHÀ", h1_style))
    story.append(Paragraph("<b>5.1. Cài đặt môi trường trên máy nhà:</b><br/>"
                           "• Cài đặt Node.js LTS từ https://nodejs.org<br/>"
                           "• Cài đặt Git từ https://git-scm.com và GitHub Desktop từ https://desktop.github.com<br/>"
                           "• Cài đặt trình soạn thảo VSCode hoặc Cursor.", body_style))
    
    story.append(Paragraph("<b>5.2. Lấy mã nguồn về máy nhà:</b><br/>"
                           "• Mở GitHub Desktop -> Clone repo https://github.com/oPSDo/BPAC_WEB về thư mục máy nhà.<br/>"
                           "• (Hoặc copy từ Google Drive M:\\My Drive\\Dev\\ENQ\\TramTron_Web\\ENQ_WEB).", body_style))

    story.append(Paragraph("<b>5.3. Khởi chạy thử nghiệm Local:</b>", body_style))
    story.append(Paragraph("cd BPAC_WEB<br/>npm install<br/>npm start", code_style))
    story.append(Paragraph("Mở trình duyệt: <b>http://localhost:36322</b> (Tài khoản: <b>admin / 123456</b>)", body_style))

    story.append(Paragraph("<b>5.4. Quy trình sửa code và đẩy lên Cloud Render:</b><br/>"
                           "1. Sửa đổi code trên VSCode -> lưu file.<br/>"
                           "2. Mở GitHub Desktop -> Nhập Summary -> Bấm <b>Commit to main</b>.<br/>"
                           "3. Bấm <b>Push origin</b> để đẩy lên GitHub.<br/>"
                           "4. Cloud Render sẽ tự động build lại và cập nhật trang https://tram-tron-net.onrender.com sau 1-2 phút.", body_style))

    # 6. Kế hoạch roadmap
    story.append(Paragraph("6. KẾ HOẠCH & ĐỊNH HƯỚNG MỞ RỘNG (ROADMAP)", h1_style))
    story.append(Paragraph("• <b>Nâng cấp Database phân tán:</b> Khi dữ liệu đạt hàng ngàn chuyến xe, chuyển sang PostgreSQL (Supabase / Neon) hoặc MySQL Cloud.", body_style))
    story.append(Paragraph("• <b>Xuất báo cáo Excel / PDF:</b> Thêm tính năng xuất file Excel tổng hợp tháng cho phòng kế toán.", body_style))
    story.append(Paragraph("• <b>Biểu đồ trực quan:</b> Tích hợp Chart.js biểu diễn sản lượng theo giờ và tỷ lệ các mác bê tông.", body_style))
    story.append(Paragraph("• <b>Phân quyền người dùng:</b> Tách quyền Ban Giám Đốc (chỉ xem) và Quản Đốc Trạm (được sửa công thức/xóa đơn).", body_style))

    doc.build(story)
    print(f"Đã tạo thành công file PDF: {pdf_path}")

# ==============================================================================
# THỰC THI XUẤT TÀI LIỆU
# ==============================================================================
if __name__ == '__main__':
    base_dir = r"C:\Users\Admin\Documents\GitHub\oPSDo\BPAC_WEB"
    docx_file = os.path.join(base_dir, "QUY_HOACH_DU_AN_BPAC_ENQ01.docx")
    pdf_file = os.path.join(base_dir, "QUY_HOACH_DU_AN_BPAC_ENQ01.pdf")

    create_word_document(docx_file)
    create_pdf_document(pdf_file)

    # Sao chép sang Google Drive và workspace
    drive_dir = r"M:\My Drive\Dev\ENQ\TramTron_Web\ENQ_WEB"
    ws_dir = r"d:\BPAC_2026RT"

    import shutil
    for target_dir in [drive_dir, ws_dir]:
        if os.path.exists(target_dir):
            shutil.copy2(docx_file, os.path.join(target_dir, "QUY_HOACH_DU_AN_BPAC_ENQ01.docx"))
            shutil.copy2(pdf_file, os.path.join(target_dir, "QUY_HOACH_DU_AN_BPAC_ENQ01.pdf"))
            print(f"Đã sao chép thành công sang: {target_dir}")

    print("Hoàn tất xuất tài liệu Word và PDF!")

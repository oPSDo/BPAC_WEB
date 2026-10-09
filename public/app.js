document.addEventListener('DOMContentLoaded', () => {
  const selectDate = document.getElementById('selectDate');
  const inputSearch = document.getElementById('inputSearch');
  const tripsContainer = document.getElementById('tripsContainer');
  const tripBadgeCount = document.getElementById('tripBadgeCount');
  
  // KPIs
  const statTotalTrips = document.getElementById('statTotalTrips');
  const statLatestTrip = document.getElementById('statLatestTrip');
  const statLastSync = document.getElementById('statLastSync');

  // Summary buttons
  const btnViewDailyPDF = document.getElementById('btnViewDailyPDF');
  const btnDownloadDailyXLS = document.getElementById('btnDownloadDailyXLS');
  const btnViewVehiclesPDF = document.getElementById('btnViewVehiclesPDF');
  const btnDownloadVehiclesXLS = document.getElementById('btnDownloadVehiclesXLS');

  // Modal
  const pdfModal = document.getElementById('pdfModal');
  const pdfIframe = document.getElementById('pdfIframe');
  const modalPdfTitle = document.getElementById('modalPdfTitle');
  const modalDownloadBtn = document.getElementById('modalDownloadBtn');
  const btnCloseModal = document.getElementById('btnCloseModal');

  // Refresh Timer
  const refreshTimerEl = document.getElementById('refreshTimer');
  const btnManualRefresh = document.getElementById('btnManualRefresh');
  let countdown = 30;
  let allTrips = [];

  // 1. Tải danh sách ngày
  async function loadDates() {
    try {
      const res = await fetch('/api/dates');
      const data = await res.json();
      
      selectDate.innerHTML = '';
      if (!data.dates || data.dates.length === 0) {
        selectDate.innerHTML = '<option value="">Chưa có dữ liệu ngày nào</option>';
        tripsContainer.innerHTML = '<div class="p-8 text-center text-slate-500">Chưa có dữ liệu nào được đồng bộ lên máy chủ.</div>';
        return;
      }

      data.dates.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        // Format hiển thị: 2026_10_09 -> Ngày 09/10/2026
        const parts = d.split('_');
        let label = d;
        if (parts.length === 3) {
          label = `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        opt.textContent = label;
        selectDate.appendChild(opt);
      });

      // Load ngày đầu tiên
      loadDayData(selectDate.value);
    } catch (err) {
      console.error(err);
      selectDate.innerHTML = '<option value="">Lỗi kết nối máy chủ</option>';
    }
  }

  // 2. Tải dữ liệu của ngày được chọn
  async function loadDayData(date) {
    if (!date) return;

    try {
      const res = await fetch(`/api/day-data?date=${encodeURIComponent(date)}`);
      const data = await res.json();

      renderDashboard(data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ngày:', err);
    }
  }

  // 3. Render Dashboard
  function renderDashboard(data) {
    allTrips = data.trips || [];

    // KPI Cards
    statTotalTrips.textContent = data.totalTrips || 0;
    tripBadgeCount.textContent = `${data.totalTrips || 0} ca xe`;

    if (allTrips.length > 0) {
      statLatestTrip.textContent = allTrips[0].time;
    } else {
      statLatestTrip.textContent = '--:--:--';
    }

    if (data.lastUpdated) {
      const d = new Date(data.lastUpdated);
      statLastSync.textContent = d.toLocaleTimeString('vi-VN') + ' ' + d.toLocaleDateString('vi-VN');
    } else {
      statLastSync.textContent = 'Mới nhất';
    }

    // Nút Báo Cáo Tổng Hợp
    setupSummaryButtons(data.date, data.summaryReports || {});

    // Danh sách các ca xe
    filterAndRenderTrips();
  }

  // 4. Thiết lập nút báo cáo tổng ngày
  function setupSummaryButtons(date, reports) {
    // Chi tiết ngày
    if (reports.pdfDailySummary) {
      btnViewDailyPDF.disabled = false;
      btnViewDailyPDF.onclick = () => openPdfViewer(reports.pdfDailySummary.name, date, 'Báo Cáo Chi Tiết Ngày ' + date);
    } else {
      btnViewDailyPDF.disabled = true;
    }

    if (reports.xlsDailySummary) {
      btnDownloadDailyXLS.disabled = false;
      btnDownloadDailyXLS.onclick = () => {
        window.location.href = `/api/file?date=${encodeURIComponent(date)}&file=${encodeURIComponent(reports.xlsDailySummary.name)}&download=true`;
      };
    } else {
      btnDownloadDailyXLS.disabled = true;
    }

    // Chi tiết xe
    if (reports.pdfDailyVehicle) {
      btnViewVehiclesPDF.disabled = false;
      btnViewVehiclesPDF.onclick = () => openPdfViewer(reports.pdfDailyVehicle.name, date, 'Báo Cáo Chi Tiết Xe ' + date);
    } else {
      btnViewVehiclesPDF.disabled = true;
    }

    if (reports.xlsDailyVehicle) {
      btnDownloadVehiclesXLS.disabled = false;
      btnDownloadVehiclesXLS.onclick = () => {
        window.location.href = `/api/file?date=${encodeURIComponent(date)}&file=${encodeURIComponent(reports.xlsDailyVehicle.name)}&download=true`;
      };
    } else {
      btnDownloadVehiclesXLS.disabled = true;
    }
  }

  // 5. Lọc và render danh sách ca xe
  function filterAndRenderTrips() {
    const query = inputSearch.value.trim().toLowerCase();
    const currentDate = selectDate.value;

    const filtered = allTrips.filter(t => {
      if (!query) return true;
      return t.time.toLowerCase().includes(query) || (t.id && t.id.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      tripsContainer.innerHTML = `
        <div class="p-10 text-center text-slate-400">
          <i class="fa-regular fa-folder-open text-4xl mb-3 text-slate-300"></i>
          <p class="text-sm font-medium">Không tìm thấy ca xe nào phù hợp.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach((trip, index) => {
      const order = filtered.length - index;
      const pdfBtn = trip.pdfFile 
        ? `<button onclick="window.viewPdf('${trip.pdfFile.name}', '${currentDate}', 'Phiếu Ca Xe: ${trip.time}')" 
              class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm active:scale-95">
             <i class="fa-solid fa-file-pdf"></i> Xem Phiếu In
           </button>`
        : `<span class="text-xs text-slate-400 italic">Chưa có PDF</span>`;

      const xlsBtn = trip.xlsFile
        ? `<a href="/api/file?date=${encodeURIComponent(currentDate)}&file=${encodeURIComponent(trip.xlsFile.name)}&download=true" 
              class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 border border-slate-200">
             <i class="fa-solid fa-file-excel text-emerald-600"></i> Excel
           </a>`
        : '';

      html += `
        <div class="p-4 sm:px-6 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center shrink-0 border border-blue-100">
              #${order}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-slate-800 font-mono tracking-tight">${trip.time}</span>
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Đã xuất</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Mã phiếu: <code class="text-slate-600 font-mono text-[11px]">${trip.id}</code></p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            ${pdfBtn}
            ${xlsBtn}
          </div>
        </div>
      `;
    });

    tripsContainer.innerHTML = html;
  }

  // 6. Mở PDF Viewer
  window.viewPdf = function(filename, date, title) {
    openPdfViewer(filename, date, title);
  };

  function openPdfViewer(filename, date, title) {
    const url = `/api/file?date=${encodeURIComponent(date)}&file=${encodeURIComponent(filename)}`;
    modalPdfTitle.textContent = title || filename;
    modalDownloadBtn.href = `/api/file?date=${encodeURIComponent(date)}&file=${encodeURIComponent(filename)}&download=true`;
    pdfIframe.src = url;
    pdfModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  btnCloseModal.addEventListener('click', () => {
    pdfModal.classList.add('hidden');
    pdfIframe.src = '';
    document.body.style.overflow = '';
  });

  // Sự kiện chọn ngày và tìm kiếm
  selectDate.addEventListener('change', () => {
    loadDayData(selectDate.value);
  });

  inputSearch.addEventListener('input', () => {
    filterAndRenderTrips();
  });

  // Tự động đếm ngược 30s refresh
  setInterval(() => {
    countdown--;
    if (refreshTimerEl) refreshTimerEl.textContent = `${countdown}s`;
    if (countdown <= 0) {
      countdown = 30;
      loadDayData(selectDate.value);
    }
  }, 1000);

  btnManualRefresh.addEventListener('click', () => {
    countdown = 30;
    if (refreshTimerEl) refreshTimerEl.textContent = '30s';
    loadDayData(selectDate.value);
  });

  // Khởi chạy nạp danh sách ngày
  loadDates();
});

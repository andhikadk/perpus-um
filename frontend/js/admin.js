/**
 * Admin Dashboard JavaScript
 * Handles dashboard functionality, charts, and data tables
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // 1. PROFILE DROPDOWN FUNCTIONALITY
  // ============================================
  const profileButton = document.getElementById('profileButton');
  const profileDropdown = document.getElementById('profileDropdown');

  if (profileButton && profileDropdown) {
    profileButton.addEventListener('click', () => {
      profileDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }

  // ============================================
  // 2. CHART.JS REGISTRATION CHART
  // ============================================
  const chartCanvas = document.getElementById('registrationChart');
  let registrationChart;
  const chartAvailable = !!chartCanvas && typeof Chart !== 'undefined';

  if (!chartAvailable) {
    console.warn('Chart initialization skipped: canvas or Chart.js is not available');
  }

  /**
   * Generate sample data for chart
   */
  function generateData(days) {
    const data = [];
    const labels = [];
    let date = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const currentDate = new Date(date);
      currentDate.setDate(date.getDate() - i);

      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);

      // Generate random sample data
      data.push(Math.floor(Math.random() * 16) + 5);
    }

    return { labels, data };
  }

  /**
   * Create or update registration chart
   */
  function createChart(days) {
    if (!chartAvailable) {
      return;
    }

    const { labels, data } = generateData(days);
    const ctx = chartCanvas.getContext('2d');

    if (registrationChart) {
      registrationChart.destroy();
    }

    registrationChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Jumlah Pendaftaran',
          data: data,
          borderColor: '#facc15',
          backgroundColor: '#fef9c3',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#facc15',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 5 }
          }
        }
      }
    });
  }

  // Initialize chart with 30 days data
  createChart(30);

  // ============================================
  // 3. TIME PERIOD BUTTONS
  // ============================================
  const lastWeekBtn = document.getElementById('lastWeekBtn');
  const lastMonthBtn = document.getElementById('lastMonthBtn');

  if (lastWeekBtn && lastMonthBtn) {
    lastWeekBtn.addEventListener('click', function() {
      this.classList.add('bg-yellow-400', 'hover:bg-yellow-500');
      this.classList.remove('bg-gray-100', 'hover:bg-gray-200');
      lastMonthBtn.classList.remove('bg-yellow-400', 'hover:bg-yellow-500');
      lastMonthBtn.classList.add('bg-gray-100', 'hover:bg-gray-200');
      createChart(7);
    });

    lastMonthBtn.addEventListener('click', function() {
      this.classList.add('bg-yellow-400', 'hover:bg-yellow-500');
      this.classList.remove('bg-gray-100', 'hover:bg-gray-200');
      lastWeekBtn.classList.remove('bg-yellow-400', 'hover:bg-yellow-500');
      lastWeekBtn.classList.add('bg-gray-100', 'hover:bg-gray-200');
      createChart(30);
    });
  }

  // ============================================
  // 4. CURRENT DATE DISPLAY
  // ============================================
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const now = new Date();
    const namaHari = hari[now.getDay()];
    const tgl = String(now.getDate()).padStart(2, '0');
    const bln = String(now.getMonth() + 1).padStart(2, '0');
    const thn = now.getFullYear();
    currentDateEl.textContent = `${namaHari}, ${tgl}-${bln}-${thn}`;
  }

  // ============================================
  // 5. TAB SWITCHING (Dashboard & Data Mahasiswa)
  // ============================================
  const dashboardNav = document.getElementById('dashboardNav');
  const dataNav = document.getElementById('dataNav');
  const dashboardSection = document.getElementById('dashboardSection');
  const dataSection = document.getElementById('dataSection');
  const pageTitle = document.getElementById('pageTitle');

  function showDashboard() {
    dashboardSection.classList.remove('hidden');
    dataSection.classList.add('hidden');
    dashboardNav.classList.add('bg-gray-100');
    dataNav.classList.remove('bg-gray-100');
    if (pageTitle) pageTitle.textContent = 'Dashboard';
    if (registrationChart && typeof registrationChart.resize === 'function') {
      registrationChart.resize();
    }
  }

  function showData() {
    dashboardSection.classList.add('hidden');
    dataSection.classList.remove('hidden');
    dataNav.classList.add('bg-gray-100');
    dashboardNav.classList.remove('bg-gray-100');
    if (pageTitle) pageTitle.textContent = 'Data Mahasiswa';
  }

  if (dashboardNav && dataNav) {
    dashboardNav.addEventListener('click', function(e) {
      e.preventDefault();
      location.hash = '#dashboard';
    });

    dataNav.addEventListener('click', function(e) {
      e.preventDefault();
      location.hash = '#data';
    });
  }

  // ============================================
  // 6. HASH CHANGE HANDLER (URL-based navigation)
  // ============================================
  function handleHashChange() {
    const h = window.location.hash;
    if (h === '#data') {
      showData();
    } else {
      showDashboard();
    }
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange(); // Initial load

  // ============================================
  // 7. RESUME CARDS (Statistics)
  // ============================================
  /**
   * Parse date in DD/MM/YYYY format
   */
  function parseDMY(text) {
    if (!text) return null;
    const parts = text.trim().split('/');
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    return new Date(y, m, d);
  }

  /**
   * Update resume card statistics
   */
  function updateResumeCards() {
    const rows = document.querySelectorAll('#dataSection tbody tr');
    const total = rows.length;
    let active = 0;
    let inactive = 0;
    let newCount = 0;
    const now = new Date();

    rows.forEach(row => {
      const statusCell = row.querySelector('td:nth-child(3)');
      const text = statusCell ? statusCell.textContent.trim().toLowerCase() : '';
      if (text.includes('aktif')) active++;
      else inactive++;

      const dateCell = row.querySelector('td:nth-child(2)');
      const dateText = dateCell ? dateCell.textContent.trim() : '';
      const parsed = parseDMY(dateText);
      if (parsed) {
        const diffMs = now - parsed;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays <= 7) newCount++;
      }
    });

    const totalEl = document.getElementById('totalCount');
    const activeEl = document.getElementById('activeCount');
    const inactiveEl = document.getElementById('inactiveCount');
    const newEl = document.getElementById('newCount');

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (inactiveEl) inactiveEl.textContent = inactive;
    if (newEl) newEl.textContent = newCount;
  }

  // Make resume cards clickable
  document.querySelectorAll('.resume-card').forEach(card => {
    card.addEventListener('click', () => {
      location.hash = '#data';
    });
  });

  // Initialize statistics
  updateResumeCards();

  // ============================================
  // 8. SEARCH/FILTER FUNCTIONALITY
  // ============================================
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const q = this.value.trim().toLowerCase();
      const rows = document.querySelectorAll('#dataSection tbody tr');
      rows.forEach(row => {
        const name = row.querySelector('td:nth-child(1)')?.textContent.trim().toLowerCase() || '';
        const date = row.querySelector('td:nth-child(2)')?.textContent.trim().toLowerCase() || '';
        const status = row.querySelector('td:nth-child(3)')?.textContent.trim().toLowerCase() || '';
        if (!q || name.includes(q) || date.includes(q) || status.includes(q)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
});

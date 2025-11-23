/**
 * Dashboard JavaScript
 * Handles dashboard functionality, charts, and statistics
 */

// ============================================
// AUTHENTICATION CHECK
// ============================================
function checkAuthentication() {
  const token = localStorage.getItem('authToken');
  const adminEmail = localStorage.getItem('adminEmail');

  if (!token || !adminEmail) {
    // No token, redirect to login
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================
function initializeLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();

      const token = localStorage.getItem('authToken');
      try {
        await fetch(`${CONFIG.API.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminId');

      // Redirect to login
      window.location.href = 'login.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Check authentication first
  if (!checkAuthentication()) {
    return;
  }

  // Initialize logout button
  initializeLogout();

  // ============================================
  // 1. SIDEBAR TOGGLE FOR MOBILE
  // ============================================
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });

    // Close sidebar when a nav link is clicked
    const navLinks = sidebar.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.add('hidden');
      });
    });
  }

  // ============================================
  // 2. PROFILE DROPDOWN FUNCTIONALITY
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
  // 3. CHART.JS REGISTRATION CHART
  // ============================================
  const chartCanvas = document.getElementById('registrationChart');
  let registrationChart;
  const chartAvailable = !!chartCanvas && typeof Chart !== 'undefined';

  if (!chartAvailable) {
    console.warn('Chart initialization skipped: canvas or Chart.js is not available');
  }

  /**
   * Fetch real statistics from backend
   */
  async function fetchDashboardStats() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API.BASE_URL}/members/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch stats');
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  }

  /**
   * Fetch registration trend data from backend
   */
  async function fetchRegistrationTrend(days) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API.BASE_URL}/members/dashboard/registration-trend?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch registration trend');
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching registration trend:', error);
      return null;
    }
  }

  /**
   * Format trend data for chart
   */
  function formatTrendData(trendData) {
    const labels = [];
    const data = [];

    trendData.forEach(item => {
      // Parse date and format as DD/MM
      const date = new Date(item.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);
      data.push(item.count);
    });

    return { labels, data };
  }

  /**
   * Create or update registration chart with real data
   */
  async function createChart(days) {
    if (!chartAvailable) {
      return;
    }

    // Fetch real data from backend
    const trendData = await fetchRegistrationTrend(days);

    if (!trendData) {
      console.warn('No trend data available, chart not created');
      return;
    }

    const { labels, data } = formatTrendData(trendData);
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
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });
  }

  // Initialize chart with 30 days data
  createChart(30);

  // ============================================
  // 3.5. PROFESSION PIE CHART
  // ============================================
  const professionChartCanvas = document.getElementById('professionChart');
  let professionChart;
  const professionChartAvailable = !!professionChartCanvas && typeof Chart !== 'undefined';

  if (!professionChartAvailable) {
    console.warn('Profession chart initialization skipped: canvas or Chart.js is not available');
  }

  /**
   * Fetch profession statistics from backend
   */
  async function fetchProfessionStats() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API.BASE_URL}/members/dashboard/profession-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch profession stats');
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching profession stats:', error);
      return null;
    }
  }

  /**
   * Create profession pie chart
   */
  async function createProfessionChart() {
    if (!professionChartAvailable) {
      return;
    }

    const stats = await fetchProfessionStats();

    if (!stats) {
      console.warn('No profession stats available');
      return;
    }

    const ctx = professionChartCanvas.getContext('2d');

    if (professionChart) {
      professionChart.destroy();
    }

    const mahasiswaCount = stats.Mahasiswa || 0;
    const umumCount = stats.Umum || 0;
    const total = mahasiswaCount + umumCount;

    // Show message if no data
    if (total === 0) {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'center';
      ctx.fillText('Belum ada data profesi', professionChartCanvas.width / 2, professionChartCanvas.height / 2);
      return;
    }

    professionChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Mahasiswa', 'Umum'],
        datasets: [{
          data: [mahasiswaCount, umumCount],
          backgroundColor: [
            '#3B82F6', // Blue for Mahasiswa
            '#10B981'  // Green for Umum
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Initialize profession pie chart
  createProfessionChart();

  // ============================================
  // 4. TIME PERIOD BUTTONS
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
  // 5. CURRENT DATE DISPLAY
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
  // 6. RESUME CARDS (Statistics)
  // ============================================
  /**
   * Update resume card statistics from real data
   */
  async function updateResumeCards() {
    const stats = await fetchDashboardStats();

    const totalEl = document.getElementById('totalCount');
    const activeEl = document.getElementById('activeCount');
    const inactiveEl = document.getElementById('inactiveCount');
    const newEl = document.getElementById('newCount');

    if (stats) {
      if (totalEl) totalEl.textContent = stats.total || 0;
      if (activeEl) activeEl.textContent = stats.active || 0;
      if (inactiveEl) inactiveEl.textContent = stats.inactive || 0;
      if (newEl) newEl.textContent = stats.newRegistrations || 0;
    }
  }

  // Make resume cards clickable with filter (navigate to member data page)
  const cardNew = document.getElementById('cardNew');
  const cardTotal = document.getElementById('cardTotal');
  const cardActive = document.getElementById('cardActive');
  const cardInactive = document.getElementById('cardInactive');

  if (cardNew) {
    cardNew.addEventListener('click', () => {
      window.location.href = 'view_table_mahasiswa.html?filter=new';
    });
  }

  if (cardTotal) {
    cardTotal.addEventListener('click', () => {
      window.location.href = 'view_table_mahasiswa.html?filter=all';
    });
  }

  if (cardActive) {
    cardActive.addEventListener('click', () => {
      window.location.href = 'view_table_mahasiswa.html?filter=active';
    });
  }

  if (cardInactive) {
    cardInactive.addEventListener('click', () => {
      window.location.href = 'view_table_mahasiswa.html?filter=inactive';
    });
  }

  // Initialize statistics
  updateResumeCards();
});

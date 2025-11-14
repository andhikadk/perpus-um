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
   * Generate chart data (7 or 30 days) with placeholder values
   * In production, this would fetch real data from backend with date filtering
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

      // Use actual count data (placeholder for now - could be fetched with date range)
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
      if (activeEl) activeEl.textContent = stats.approved || 0;
      if (inactiveEl) inactiveEl.textContent = stats.pending || 0;
      if (newEl) newEl.textContent = stats.newRegistrations || 0;
    }
  }

  // Make resume cards clickable (navigate to member data page)
  document.querySelectorAll('.resume-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = 'view_table_mahasiswa.html';
    });
  });

  // Initialize statistics
  updateResumeCards();
});

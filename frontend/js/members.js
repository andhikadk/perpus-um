/**
 * Members Data Page JavaScript
 * Handles member list display, search, and detail navigation
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
  // 3. CURRENT DATE DISPLAY
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
  // 4. FETCH AND POPULATE MEMBER DATA
  // ============================================
  /**
   * Fetch all members from backend and populate table
   */
  async function fetchAndPopulateMembers() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API.BASE_URL}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch members');
        const tbody = document.querySelector('tbody');
        if (tbody) {
          tbody.innerHTML = '<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center text-red-500" colspan="4">Gagal memuat data</td></tr>';
        }
        return [];
      }

      const data = await response.json();
      const members = data.data || [];

      // Populate table
      const tbody = document.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '';

        if (members.length === 0) {
          tbody.innerHTML = '<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center text-gray-500" colspan="4">Tidak ada data</td></tr>';
          return [];
        }

        members.forEach(member => {
          const tr = document.createElement('tr');
          tr.className = 'border-b hover:bg-gray-50';

          const registrationDate = member.registration_date ? new Date(member.registration_date).toLocaleDateString('id-ID') : '-';
          const status = member.status || 'pending';
          const statusLabel = status === 'approved' ? 'Disetujui' : status === 'rejected' ? 'Ditolak' : 'Menunggu';

          tr.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${member.name || '-'}</td>
            <td class="px-4 py-3 text-sm text-gray-500">${registrationDate}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded text-xs font-medium ${
              status === 'approved' ? 'bg-green-100 text-green-700' :
              status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }">${statusLabel}</span></td>
            <td class="px-4 py-3">
              <button class="text-blue-600 hover:underline view-detail-btn" data-id="${member.id}">
                Lihat Detail <i class="fas fa-chevron-right text-xs ml-1"></i>
              </button>
            </td>
          `;

          tbody.appendChild(tr);
        });

        // Add event listeners to detail buttons
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            window.location.href = `detail_mahasiswa.html?id=${memberId}`;
          });
        });
      }

      return members;
    } catch (error) {
      console.error('Error fetching members:', error);
      const tbody = document.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center text-red-500" colspan="4">Error: ' + error.message + '</td></tr>';
      }
      return [];
    }
  }

  // ============================================
  // 5. SEARCH/FILTER FUNCTIONALITY
  // ============================================
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const q = this.value.trim().toLowerCase();
      const rows = document.querySelectorAll('tbody tr');
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

  // Initialize: Load member data
  fetchAndPopulateMembers();
});

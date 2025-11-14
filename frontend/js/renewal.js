/**
 * Renewal Management Page JavaScript
 * Handles renewal request list display and approve/reject actions
 */

let currentRenewalId = null;

/**
 * Initialize logout functionality
 */
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

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID');
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  let badgeClass = 'bg-yellow-100 text-yellow-800';
  let statusText = status;

  if (status === 'approved') {
    badgeClass = 'bg-green-100 text-green-800';
    statusText = 'Disetujui';
  } else if (status === 'rejected') {
    badgeClass = 'bg-red-100 text-red-800';
    statusText = 'Ditolak';
  } else if (status === 'pending') {
    badgeClass = 'bg-yellow-100 text-yellow-800';
    statusText = 'Menunggu';
  }

  return `<span class="px-3 py-1 rounded-full text-xs font-medium ${badgeClass}">${statusText}</span>`;
}

/**
 * Load renewal requests from API
 */
async function loadRenewals() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${CONFIG.API.BASE_URL}/members/renewals/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Gagal memuat data perpanjangan');
    }

    const data = await response.json();
    const renewals = data.data || [];

    // Populate table
    const tableBody = document.getElementById('renewalTableBody');

    if (renewals.length === 0) {
      tableBody.innerHTML = `
        <tr class="hover:bg-gray-50">
          <td class="px-4 py-3 text-center text-gray-500" colspan="5">Tidak ada data perpanjangan</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = renewals.map(renewal => `
      <tr class="border-b hover:bg-gray-50">
        <td class="px-4 py-3">${renewal.name || '-'}</td>
        <td class="px-4 py-3">${renewal.nim || '-'}</td>
        <td class="px-4 py-3">${formatDate(renewal.request_date)}</td>
        <td class="px-4 py-3">${getStatusBadge(renewal.status)}</td>
        <td class="px-4 py-3">
          <div class="flex gap-2">
            ${renewal.status === 'pending' ? `
              <button class="approve-renewal-btn px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600" data-renewal-id="${renewal.id}">
                <i class="fas fa-check mr-1"></i>Setujui
              </button>
              <button class="reject-renewal-btn px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600" data-renewal-id="${renewal.id}">
                <i class="fas fa-times mr-1"></i>Tolak
              </button>
            ` : `
              <span class="text-gray-400 text-sm">Tidak ada aksi</span>
            `}
          </div>
        </td>
      </tr>
    `).join('');

    // Attach event listeners
    attachRenewalEventListeners();
  } catch (error) {
    console.error('Error loading renewals:', error);
    const tableBody = document.getElementById('renewalTableBody');
    tableBody.innerHTML = `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 text-center text-red-500" colspan="5">Error: ${error.message}</td>
      </tr>
    `;
  }
}

/**
 * Attach event listeners to renewal action buttons
 */
function attachRenewalEventListeners() {
  // Approve buttons
  document.querySelectorAll('.approve-renewal-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const renewalId = this.dataset.renewalId;

      // Show confirmation
      const confirmed = confirm('Apakah Anda yakin ingin menyetujui perpanjangan ini?');
      if (!confirmed) return;

      // Show loading state
      this.disabled = true;
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Sedang memproses...';

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/renewals/${renewalId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          alert('Gagal menyetujui: ' + (data.message || 'Server error'));
          this.disabled = false;
          this.innerHTML = originalText;
          return;
        }

        // Success
        alert('Perpanjangan berhasil disetujui! Email notifikasi telah dikirim ke anggota.');
        loadRenewals();
      } catch (error) {
        console.error('Approve error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        this.disabled = false;
        this.innerHTML = originalText;
      }
    });
  });

  // Reject buttons
  document.querySelectorAll('.reject-renewal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      currentRenewalId = this.dataset.renewalId;
      // Show rejection reason modal
      document.getElementById('rejectionModal').classList.remove('hidden');
    });
  });
}

// Initialize page on DOM ready
window.addEventListener('DOMContentLoaded', async function() {
  'use strict';

  // ============================================
  // SETUP CURRENT DATE DISPLAY
  // ============================================
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('id-ID', options);
  }

  // ============================================
  // SIDEBAR TOGGLE FOR MOBILE
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

  // Initialize logout button
  initializeLogout();

  // ============================================
  // PROFILE DROPDOWN
  // ============================================
  const profileButton = document.getElementById('profileButton');
  const profileDropdown = document.getElementById('profileDropdown');

  if (profileButton && profileDropdown) {
    profileButton.addEventListener('click', () => {
      profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
      if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }

  // ============================================
  // LOAD RENEWAL REQUESTS
  // ============================================
  loadRenewals();

  // ============================================
  // REJECTION MODAL HANDLING
  // ============================================
  const rejectionModal = document.getElementById('rejectionModal');
  const rejectionForm = document.getElementById('rejectionForm');
  const cancelRejectionBtn = document.getElementById('cancelRejectionBtn');

  if (cancelRejectionBtn) {
    cancelRejectionBtn.addEventListener('click', function() {
      rejectionModal.classList.add('hidden');
      rejectionForm.reset();
      currentRenewalId = null;
    });
  }

  if (rejectionForm) {
    rejectionForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const reason = document.getElementById('rejectionReason').value.trim();

      if (!reason) {
        alert('Silakan masukkan alasan penolakan');
        return;
      }

      if (!currentRenewalId) {
        alert('Error: Renewal ID tidak ditemukan');
        return;
      }

      // Show loading state
      const submitBtn = rejectionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sedang memproses...';

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/renewals/${currentRenewalId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (!response.ok) {
          alert('Gagal menolak: ' + (data.message || 'Server error'));
          submitBtn.disabled = false;
          submitBtn.textContent = 'Tolak Perpanjangan';
          return;
        }

        // Success
        alert('Perpanjangan ditolak. Email pemberitahuan dengan alasan telah dikirim ke anggota.');
        rejectionModal.classList.add('hidden');
        rejectionForm.reset();
        currentRenewalId = null;
        loadRenewals();
      } catch (error) {
        console.error('Reject error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tolak Perpanjangan';
      }
    });
  }

  // Close modal when clicking outside
  rejectionModal.addEventListener('click', function(e) {
    if (e.target === rejectionModal) {
      rejectionModal.classList.add('hidden');
      rejectionForm.reset();
      currentRenewalId = null;
    }
  });
});

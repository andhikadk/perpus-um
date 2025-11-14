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
  // GET FILTER FROM URL PARAMETER
  // ============================================
  const urlParams = new URLSearchParams(window.location.search);
  const filterType = urlParams.get('filter') || 'all';

  // Show filter badge if filter is applied
  const filterBadge = document.getElementById('filterBadge');
  const filterText = document.getElementById('filterText');
  const clearFilterBtn = document.getElementById('clearFilter');

  const filterLabels = {
    'all': 'Semua Member',
    'new': 'Pendaftar Baru (7 Hari)',
    'active': 'Member Aktif',
    'inactive': 'Member Tidak Aktif'
  };

  if (filterType !== 'all' && filterBadge && filterText) {
    filterBadge.classList.remove('hidden');
    filterText.textContent = `Filter: ${filterLabels[filterType] || 'Semua'}`;
  }

  // Clear filter button
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', function() {
      window.location.href = 'view_table_mahasiswa.html';
    });
  }

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
   * Filter members based on filter type
   */
  function filterMembers(members, filterType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    switch (filterType) {
      case 'new':
        // Members registered in last 7 days
        return members.filter(member => {
          if (!member.registration_date) return false;
          const regDate = new Date(member.registration_date);
          regDate.setHours(0, 0, 0, 0);
          return regDate >= sevenDaysAgo;
        });

      case 'active':
        // Approved AND (not expired OR no expiry date)
        return members.filter(member => {
          if (member.status !== 'approved') return false;
          if (!member.membership_expiry_date) return true;
          const expiryDate = new Date(member.membership_expiry_date);
          expiryDate.setHours(0, 0, 0, 0);
          return expiryDate >= today;
        });

      case 'inactive':
        // Pending, rejected, or expired approved
        return members.filter(member => {
          // Pending or rejected
          if (member.status === 'pending' || member.status === 'rejected') {
            return true;
          }
          // Approved but expired
          if (member.status === 'approved' && member.membership_expiry_date) {
            const expiryDate = new Date(member.membership_expiry_date);
            expiryDate.setHours(0, 0, 0, 0);
            return expiryDate < today;
          }
          return false;
        });

      case 'all':
      default:
        return members;
    }
  }

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
          tbody.innerHTML = '<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center text-red-500" colspan="5">Gagal memuat data</td></tr>';
        }
        return [];
      }

      const data = await response.json();
      let members = data.data || [];

      // Apply filter
      members = filterMembers(members, filterType);

      // Populate table
      const tbody = document.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '';

        if (members.length === 0) {
          tbody.innerHTML = '<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center text-gray-500" colspan="5">Tidak ada data</td></tr>';
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
            <td class="px-4 py-3">
              <button class="text-red-600 hover:text-red-800 delete-member-btn" data-id="${member.id}" data-name="${member.name || 'Anggota'}" title="Hapus anggota">
                <i class="fas fa-trash"></i>
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

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-member-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            const memberName = this.getAttribute('data-name');
            showDeleteModal(memberId, memberName);
          });
        });
      }

      return members;
    } catch (error) {
      console.error('Error fetching members:', error);
      const tbody = document.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center text-red-500" colspan="5">Error: ' + error.message + '</td></tr>';
      }
      return [];
    }
  }

  // ============================================
  // 5. DELETE MEMBER FUNCTIONALITY
  // ============================================
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const deleteMemberName = document.getElementById('deleteMemberName');
  let memberToDelete = null;

  /**
   * Show delete confirmation modal
   */
  function showDeleteModal(memberId, memberName) {
    memberToDelete = memberId;
    if (deleteMemberName) {
      deleteMemberName.textContent = memberName;
    }
    if (deleteModal) {
      deleteModal.classList.remove('hidden');
    }
  }

  /**
   * Hide delete modal
   */
  function hideDeleteModal() {
    memberToDelete = null;
    if (deleteModal) {
      deleteModal.classList.add('hidden');
    }
  }

  // Cancel delete button
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
  }

  // Confirm delete button
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async function() {
      if (!memberToDelete) return;

      // Show loading state
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = 'Menghapus...';

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/${memberToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          alert('Gagal menghapus: ' + (data.message || 'Server error'));
          confirmDeleteBtn.disabled = false;
          confirmDeleteBtn.textContent = 'Ya, Hapus';
          return;
        }

        // Success
        alert('Data anggota berhasil dihapus');
        hideDeleteModal();

        // Reset button state
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Ya, Hapus';

        // Reload member list
        await fetchAndPopulateMembers();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Ya, Hapus';
      }
    });
  }

  // Close modal when clicking outside
  if (deleteModal) {
    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) {
        hideDeleteModal();
      }
    });
  }

  // ============================================
  // 6. SEARCH/FILTER FUNCTIONALITY
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

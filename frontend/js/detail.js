/**
 * Detail Member Page JavaScript
 * Handles member detail display and actions (approve/reject)
 */

/**
 * Get URL query parameter
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || '';
}

/**
 * Initialize logout functionality
 */
function initializeLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function (e) {
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

// Initialize page on DOM ready
window.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize logout button
  initializeLogout();

  // ============================================
  // 1. GET MEMBER ID AND FETCH DATA FROM API
  // ============================================
  const memberId = getQueryParam('id');

  if (!memberId) {
    alert('Member ID tidak ditemukan');
    window.location.href = 'view_table_mahasiswa.html#data';
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${CONFIG.API.BASE_URL}/members/${memberId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      alert('Gagal memuat data anggota');
      window.location.href = 'view_table_mahasiswa.html#data';
      return;
    }

    const data = await response.json();
    const member = data.data;

    // Helper function to build file URL
    const getFileUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      if (path.startsWith('/')) return `http://localhost:3000${path}`;
      return `http://localhost:3000/${path}`;
    };

    // ============================================
    // 2. POPULATE MEMBER INFORMATION
    // ============================================
    if (member.name) document.getElementById('detail-nama').textContent = member.name;
    if (member.nim) document.getElementById('detail-nim').textContent = member.nim;
    if (member.email) document.getElementById('detail-email').textContent = member.email;

    // Display photo
    if (member.photo_path) {
      const fotoEl = document.getElementById('detail-foto');
      fotoEl.src = getFileUrl(member.photo_path);
      fotoEl.onerror = function () {
        this.src = './assets/logo-um.png';
      };
    }

    if (member.institution) document.getElementById('detail-asal').textContent = member.institution;
    if (member.profession) document.getElementById('detail-profession').textContent = member.profession;
    if (member.program) document.getElementById('detail-institution').textContent = member.program;
    if (member.registration_date) {
      document.getElementById('detail-tanggal').textContent = new Date(member.registration_date).toLocaleDateString('id-ID');
    }

    // Personal information
    if (member.birth_place) document.getElementById('detail-birthPlace').textContent = member.birth_place;
    if (member.birth_date) document.getElementById('detail-birthDate').textContent = new Date(member.birth_date).toLocaleDateString('id-ID');
    if (member.gender) {
      const genderText = member.gender === 'male' ? 'Laki-laki' : (member.gender === 'female' ? 'Perempuan' : member.gender);
      document.getElementById('detail-gender').textContent = genderText;
    }
    if (member.address) document.getElementById('detail-address').textContent = member.address;

    // ============================================
    // 3. DISPLAY PAYMENT PROOF
    // ============================================
    if (member.payment_proof_path) {
      const paymentEl = document.getElementById('detail-payment');
      if (paymentEl) {
        const fileUrl = getFileUrl(member.payment_proof_path);
        const lower = member.payment_proof_path.toLowerCase();
        if (lower.endsWith('.pdf')) {
          paymentEl.innerHTML = `<a href="${fileUrl}" target="_blank" class="text-yellow-600 hover:underline"><i class="fas fa-file-pdf mr-1"></i>Lihat Bukti Transfer (PDF)</a>`;
        } else {
          paymentEl.innerHTML = `<img src="${fileUrl}" alt="Bukti Transfer" class="h-32 object-contain border rounded" onerror="this.src='./assets/logo-um.png'"/>`;
        }
      }
    } else {
      const paymentEl = document.getElementById('detail-payment');
      if (paymentEl) {
        paymentEl.textContent = '-';
      }
    }

    // ============================================
    // 4. DISPLAY SIGNATURE
    // ============================================
    if (member.signature_path) {
      const signatureEl = document.getElementById('detail-signature');
      if (signatureEl) {
        const fileUrl = getFileUrl(member.signature_path);
        signatureEl.innerHTML = `<img src="${fileUrl}" alt="Tanda Tangan" class="h-28 object-contain border rounded" onerror="this.src='./assets/logo-um.png'"/>`;
      }
    } else {
      const signatureEl = document.getElementById('detail-signature');
      if (signatureEl) {
        signatureEl.textContent = '-';
      }
    }

    // ============================================
    // 5. IMAGE MODAL FUNCTIONALITY
    // ============================================
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalImageCaption = document.getElementById('modalImageCaption');
    const closeImageModal = document.getElementById('closeImageModal');

    // Function to open image modal
    function openImageModal(imageSrc, caption) {
      modalImage.src = imageSrc;
      modalImageCaption.textContent = caption || '';
      imageModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Function to close image modal
    function closeModal() {
      imageModal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scrolling
    }

    // Close modal button
    if (closeImageModal) {
      closeImageModal.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the image
    if (imageModal) {
      imageModal.addEventListener('click', function (e) {
        if (e.target === imageModal) {
          closeModal();
        }
      });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Make pas foto clickable
    const fotoEl = document.getElementById('detail-foto');
    if (fotoEl && member.photo_path) {
      fotoEl.style.cursor = 'pointer';
      fotoEl.title = 'Klik untuk memperbesar';
      fotoEl.addEventListener('click', function () {
        openImageModal(this.src, 'Pas Foto - ' + member.name);
      });
    }

    // Make bukti transfer clickable (if it's an image)
    const paymentEl = document.getElementById('detail-payment');
    if (paymentEl && member.payment_proof_path) {
      const lower = member.payment_proof_path.toLowerCase();
      if (!lower.endsWith('.pdf')) {
        const paymentImg = paymentEl.querySelector('img');
        if (paymentImg) {
          paymentImg.style.cursor = 'pointer';
          paymentImg.title = 'Klik untuk memperbesar';
          paymentImg.addEventListener('click', function () {
            openImageModal(this.src, 'Bukti Transfer - ' + member.name);
          });
        }
      }
    }

  } catch (error) {
    console.error('Error loading member data:', error);
    alert('Gagal memuat data anggota: ' + error.message);
    window.location.href = 'view_table_mahasiswa.html#data';
    return;
  }

  // ============================================
  // 5. ACTION BUTTONS - API INTEGRATION
  // ============================================
  const approveBtn = document.getElementById('approve-btn');
  const rejectBtn = document.getElementById('reject-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const rejectionModal = document.getElementById('rejectionModal');
  const rejectionForm = document.getElementById('rejectionForm');
  const cancelRejectionBtn = document.getElementById('cancelRejectionBtn');
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  if (approveBtn) {
    approveBtn.addEventListener('click', async function () {
      // Show confirmation
      const confirmed = confirm('Apakah Anda yakin ingin menyetujui pendaftaran ini?');
      if (!confirmed) return;

      // Show loading state
      approveBtn.disabled = true;
      approveBtn.textContent = 'Sedang memproses...';

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/${memberId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          alert('Gagal menyetujui: ' + (data.message || 'Server error'));
          approveBtn.disabled = false;
          approveBtn.textContent = 'Setujui';
          return;
        }

        // Success
        alert('Pendaftaran berhasil disetujui! Email notifikasi telah dikirim ke anggota.');
        window.location.href = 'view_table_mahasiswa.html#data';
      } catch (error) {
        console.error('Approve error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        approveBtn.disabled = false;
        approveBtn.textContent = 'Setujui';
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      // Show rejection reason modal
      rejectionModal.classList.remove('hidden');
    });
  }

  if (cancelRejectionBtn) {
    cancelRejectionBtn.addEventListener('click', function () {
      rejectionModal.classList.add('hidden');
      rejectionForm.reset();
    });
  }

  if (rejectionForm) {
    rejectionForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const reason = document.getElementById('rejectionReason').value.trim();

      if (!reason) {
        alert('Silakan masukkan alasan penolakan');
        return;
      }

      // Show loading state
      const submitBtn = rejectionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sedang memproses...';

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/${memberId}/reject`, {
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
          submitBtn.textContent = 'Tolak Pendaftaran';
          return;
        }

        // Success
        alert('Pendaftaran ditolak. Email pemberitahuan dengan alasan telah dikirim ke anggota.');
        window.location.href = 'view_table_mahasiswa.html#data';
      } catch (error) {
        console.error('Reject error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tolak Pendaftaran';
      }
    });
  }

  // Close modal when clicking outside
  rejectionModal.addEventListener('click', function (e) {
    if (e.target === rejectionModal) {
      rejectionModal.classList.add('hidden');
      rejectionForm.reset();
    }
  });

  // ============================================
  // DELETE FUNCTIONALITY
  // ============================================
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      // Show delete confirmation modal
      deleteModal.classList.remove('hidden');
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', function () {
      deleteModal.classList.add('hidden');
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async function () {
      // Show loading state
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = 'Menghapus...';

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/${memberId}`, {
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
        window.location.href = 'view_table_mahasiswa.html#data';
      } catch (error) {
        console.error('Delete error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Ya, Hapus';
      }
    });
  }

  // Close delete modal when clicking outside
  if (deleteModal) {
    deleteModal.addEventListener('click', function (e) {
      if (e.target === deleteModal) {
        deleteModal.classList.add('hidden');
      }
    });
  }

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = 'view_table_mahasiswa.html#data';
    });
  }

  // ============================================
  // PRINT MEMBER CARD FUNCTIONALITY
  // ============================================
  const printCardBtn = document.getElementById('print-card-btn');
  if (printCardBtn) {
    printCardBtn.addEventListener('click', function () {
      // Navigate to print card page with member ID
      window.location.href = `print_member_card.html?id=${memberId}`;
    });
  }

  // ============================================
  // 5. PROFILE DROPDOWN (Shared with admin pages)
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
});

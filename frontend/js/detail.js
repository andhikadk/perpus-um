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

// Initialize page on DOM ready
window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Initialize logout button
  initializeLogout();

  // ============================================
  // 1. LOAD MEMBER DATA FROM URL PARAMETERS
  // ============================================
  const nama = getQueryParam('nama');
  const nim = getQueryParam('nim');
  const email = getQueryParam('email');
  const foto = getQueryParam('foto') || getQueryParam('photo');
  const asal = getQueryParam('asal') || getQueryParam('program');
  const profession = getQueryParam('profession') || getQueryParam('fakultas');
  const institution = getQueryParam('institution');
  const prodi = getQueryParam('prodi');
  const registrationDate = getQueryParam('registrationDate') || getQueryParam('tanggal');

  const birthPlace = getQueryParam('birthPlace');
  const birthDate = getQueryParam('birthDate');
  const gender = getQueryParam('gender');
  const address = getQueryParam('address');
  const signature = getQueryParam('signature');
  const paymentProof = getQueryParam('paymentProof');

  // Populate member information
  if (nama) document.getElementById('detail-nama').textContent = nama;
  if (nim) document.getElementById('detail-nim').textContent = nim;
  if (email) document.getElementById('detail-email').textContent = email;
  if (foto) document.getElementById('detail-foto').src = foto;
  if (asal) document.getElementById('detail-asal').textContent = asal;
  if (profession) document.getElementById('detail-profession').textContent = profession;

  if (institution && document.getElementById('detail-institution')) {
    document.getElementById('detail-institution').textContent = institution;
  } else if (prodi && document.getElementById('detail-institution')) {
    document.getElementById('detail-institution').textContent = prodi;
  }

  if (registrationDate) document.getElementById('detail-tanggal').textContent = registrationDate;

  // Personal information
  if (birthPlace) document.getElementById('detail-birthPlace').textContent = birthPlace;
  if (birthDate) document.getElementById('detail-birthDate').textContent = birthDate;
  if (gender) {
    const genderText = gender === 'male' ? 'Laki-laki' : (gender === 'female' ? 'Perempuan' : gender);
    document.getElementById('detail-gender').textContent = genderText;
  }
  if (address) document.getElementById('detail-address').textContent = address;

  // ============================================
  // 2. DISPLAY PAYMENT PROOF
  // ============================================
  if (paymentProof) {
    const paymentEl = document.getElementById('detail-payment');
    if (paymentEl) {
      const lower = paymentProof.toLowerCase();
      if (lower.endsWith('.pdf')) {
        paymentEl.innerHTML = `<a href="${paymentProof}" target="_blank" class="text-yellow-600 hover:underline">Lihat Bukti Transfer (PDF)</a>`;
      } else {
        paymentEl.innerHTML = `<img src="${paymentProof}" alt="Bukti Transfer" class="h-32 object-contain border rounded"/>`;
      }
    }
  }

  // ============================================
  // 3. DISPLAY SIGNATURE
  // ============================================
  if (signature) {
    const signatureEl = document.getElementById('detail-signature');
    if (signatureEl) {
      signatureEl.innerHTML = `<img src="${signature}" alt="Tanda Tangan" class="h-28 object-contain border rounded"/>`;
    }
  }

  // ============================================
  // 4. ACTION BUTTONS
  // ============================================
  const approveBtn = document.getElementById('approve-btn');
  if (approveBtn) {
    approveBtn.addEventListener('click', function() {
      alert('Data mahasiswa telah disetujui!');
      window.location.href = 'view_table_mahasiswa.html';
    });
  }

  const rejectBtn = document.getElementById('reject-btn');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function() {
      const ok = confirm('Tolak pendaftaran ini? Tindakan ini akan membatalkan pendaftaran.');
      if (ok) {
        alert('Pendaftaran ditolak.');
        window.location.href = 'view_table_mahasiswa.html';
      }
    });
  }

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function(event) {
      event.preventDefault();
      window.location.href = 'view_table_mahasiswa.html#data';
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

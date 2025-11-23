/**
 * Member Renewal Request Page JavaScript
 * Allows members to request renewal by verifying their email and NIM
 */

let currentMemberId = null;
let currentMemberData = null;

/**
 * Display error message
 */
function showError(message) {
  const errorBox = document.getElementById('errorBox');
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  if (errorBox) {
    errorBox.classList.remove('hidden');
  }
}

/**
 * Hide error message
 */
function hideError() {
  const errorBox = document.getElementById('errorBox');
  if (errorBox) {
    errorBox.classList.add('hidden');
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
 * Get status label in Indonesian
 */
function getStatusLabel(status) {
  if (status === 'approved') return 'Disetujui';
  if (status === 'rejected') return 'Ditolak';
  if (status === 'pending') return 'Menunggu';
  return status;
}

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // STEP 1: VERIFICATION FORM HANDLER
  // ============================================
  const verificationForm = document.getElementById('verificationForm');
  if (verificationForm) {
    verificationForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      hideError();

      const email = document.getElementById('memberEmail').value.trim();
      const nim = document.getElementById('memberNim').value.trim();

      if (!email || !nim) {
        showError('Email dan NIM harus diisi');
        return;
      }

      // Show loading state
      const submitBtn = verificationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memverifikasi...';

      try {
        // Search for member using email
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/search?query=${encodeURIComponent(email)}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Gagal mencari anggota');
        }

        const data = await response.json();
        const members = data.data || [];

        // Find member by email and NIM
        const member = members.find(m => m.email === email && m.nim === nim);

        if (!member) {
          showError('Email atau NIM tidak ditemukan. Silakan cek kembali data Anda.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }

        // Store member data
        currentMemberId = member.id;
        currentMemberData = member;

        // Display member information
        document.getElementById('displayName').textContent = member.name || '-';
        document.getElementById('displayNim').textContent = member.nim || '-';
        document.getElementById('displayEmail').textContent = member.email || '-';

        const statusLabel = getStatusLabel(member.status);
        const statusElement = document.getElementById('displayStatus');
        statusElement.textContent = statusLabel;

        // Display membership expiry date with status
        let expiryInfo = 'Belum diset';
        if (member.membership_expiry_date) {
          const expiryDate = new Date(member.membership_expiry_date);
          expiryInfo = expiryDate.toLocaleDateString('id-ID');

          // Add days left info with color coding
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);

          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          if (daysLeft > 0) {
            expiryInfo += ` <span class="font-semibold text-green-700">(${daysLeft} hari lagi)</span>`;
          } else if (daysLeft === 0) {
            expiryInfo += ` <span class="font-semibold text-orange-700">(Habis hari ini)</span>`;
          } else {
            expiryInfo += ` <span class="font-semibold text-red-700">(Sudah expired ${Math.abs(daysLeft)} hari yang lalu)</span>`;
          }
        }
        document.getElementById('displayExpiryDate').innerHTML = expiryInfo;

        // Color the status based on state
        statusElement.classList.remove('text-green-700', 'text-red-700', 'text-yellow-700');
        if (member.status === 'approved') {
          statusElement.classList.add('text-green-700');
        } else if (member.status === 'rejected') {
          statusElement.classList.add('text-red-700');
        } else {
          statusElement.classList.add('text-yellow-700');
        }

        // Check if member is eligible for renewal (must be approved)
        const eligibleBox = document.getElementById('eligibleBox');
        const ineligibleBox = document.getElementById('ineligibleBox');
        const renewalForm = document.getElementById('renewalForm');

        if (member.status === 'approved') {
          if (eligibleBox) eligibleBox.classList.remove('hidden');
          if (ineligibleBox) ineligibleBox.classList.add('hidden');
          if (renewalForm) renewalForm.classList.remove('hidden');
        } else {
          if (eligibleBox) eligibleBox.classList.add('hidden');
          if (ineligibleBox) ineligibleBox.classList.remove('hidden');
          if (renewalForm) renewalForm.classList.add('hidden');
        }

        // Switch to renewal step
        document.getElementById('verificationStep').classList.add('hidden');
        document.getElementById('renewalStep').classList.remove('hidden');

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      } catch (error) {
        console.error('Verification error:', error);
        showError('Terjadi kesalahan: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // ============================================
  // STEP 2: BACK BUTTON (Go back to verification)
  // ============================================
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      document.getElementById('renewalStep').classList.add('hidden');
      document.getElementById('verificationStep').classList.remove('hidden');
      currentMemberId = null;
      currentMemberData = null;
      hideError();
    });
  }

  // ============================================
  // STEP 3: RENEWAL REQUEST FORM HANDLER
  // ============================================
  const renewalForm = document.getElementById('renewalForm');
  if (renewalForm) {
    renewalForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      hideError();

      if (!currentMemberId) {
        showError('Silakan verifikasi keanggotaan terlebih dahulu');
        return;
      }

      // Validate payment proof file
      const paymentProofInput = document.getElementById('renewalPaymentProof');
      if (!paymentProofInput.files || paymentProofInput.files.length === 0) {
        showError('Bukti transfer wajib diunggah');
        return;
      }

      const paymentProofFile = paymentProofInput.files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (paymentProofFile.size > maxSize) {
        showError('Ukuran file bukti transfer maksimal 1MB');
        return;
      }

      // Get renewal reason (optional)
      const reason = document.getElementById('renewalReason').value.trim();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('paymentProof', paymentProofFile);
      if (reason) {
        formData.append('reason', reason);
      }

      // Show loading state
      const submitBtn = renewalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mengajukan...';

      try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/members/${currentMemberId}/renewal-request`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengajukan perpanjangan');
        }

        // Show success message
        document.getElementById('renewalStep').classList.add('hidden');
        document.getElementById('successBox').classList.remove('hidden');
        currentMemberId = null;
        currentMemberData = null;

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      } catch (error) {
        console.error('Renewal request error:', error);
        showError('Terjadi kesalahan: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});

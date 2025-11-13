/**
 * Form Validation Utilities
 * Consolidated validation logic for signup and other forms
 */

// ============================================
// VALIDATION PATTERNS & CONSTANTS
// ============================================
const VALIDATION = {
  EMAIL_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  MIN_PASSWORD_LENGTH: 6,
  MIN_PASSWORD_LOGIN_LENGTH: 6,
  MESSAGES: {
    EMAIL_INVALID: 'Tolong masukkan alamat email yang valid',
    PASSWORD_TOO_SHORT: `Kata sandi harus minimal ${6} karakter`,
    TERMS_REQUIRED: 'Anda harus menyetujui syarat dan ketentuan',
    REQUIREMENTS_REQUIRED: 'Anda harus mengkonfirmasi memenuhi persyaratan',
    SIGNATURE_REQUIRED: 'Silakan masukkan tanda tangan dan tekan "Simpan TTD"'
  }
};

/**
 * Validate email format
 */
function validateEmail(email) {
  return VALIDATION.EMAIL_REGEX.test(String(email).toLowerCase());
}

/**
 * Validate password length
 */
function validatePassword(password, minLength = VALIDATION.MIN_PASSWORD_LENGTH) {
  return password && password.length >= minLength;
}

/**
 * Submit registration form to backend API
 */
async function submitRegistrationForm(form) {
  try {
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';
    }

    // Create FormData to include files
    const formData = new FormData(form);

    // Make API request
    const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Restore button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }

    if (!response.ok) {
      // Handle error response
      let errorMessage = data.message || 'Terjadi kesalahan saat mendaftar';
      if (data.errors) {
        errorMessage += '\n\n' + Object.values(data.errors).join('\n');
      }
      alert(errorMessage);
      return;
    }

    // Success
    alert(data.message || 'Pendaftaran berhasil! Anda akan menerima email konfirmasi segera.');
    form.reset();

    // Reset registration date
    const dateInput = form.querySelector('#registrationDate');
    if (dateInput) {
      const today = new Date();
      const year = today.getFullYear();
      let month = today.getMonth() + 1;
      let day = today.getDate();
      month = month < 10 ? '0' + month : month;
      day = day < 10 ? '0' + day : day;
      dateInput.value = `${year}-${month}-${day}`;
    }

  } catch (error) {
    console.error('Registration error:', error);
    alert('Terjadi kesalahan: ' + error.message);

    // Restore button state
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
}

/**
 * Initialize signup form validation
 */
function initSignupValidation() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form fields
    const name = document.getElementById('name')?.value.trim();
    const nim = document.getElementById('nim')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const program = document.getElementById('program')?.value;
    const institution = document.getElementById('institution')?.value.trim();
    const registrationDate = document.getElementById('registrationDate')?.value;
    const terms = document.getElementById('terms')?.checked;
    const requirements = document.getElementById('requirements')?.checked;

    let isValid = true;
    let errors = [];

    // Validate required fields
    if (!name) {
      errors.push('Nama harus diisi');
      isValid = false;
    }
    if (!nim) {
      errors.push('NIM/NIK harus diisi');
      isValid = false;
    }
    if (!email) {
      errors.push('Email harus diisi');
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.push(VALIDATION.MESSAGES.EMAIL_INVALID);
      isValid = false;
    }
    if (!program) {
      errors.push('Program/Fakultas harus dipilih');
      isValid = false;
    }
    if (!institution) {
      errors.push('Asal institusi harus diisi');
      isValid = false;
    }
    if (!registrationDate) {
      errors.push('Tanggal pendaftaran harus diisi');
      isValid = false;
    }

    // Validate checkboxes
    if (!terms) {
      errors.push(VALIDATION.MESSAGES.TERMS_REQUIRED);
      isValid = false;
    }
    if (!requirements) {
      errors.push(VALIDATION.MESSAGES.REQUIREMENTS_REQUIRED);
      isValid = false;
    }

    // Show errors or submit
    if (!isValid) {
      alert('Silakan perbaiki kesalahan:\n\n' + errors.join('\n'));
      return false;
    }

    // Form is valid - submit to API
    submitRegistrationForm(signupForm);
  });

  // Auto-fill today's date
  const dateInput = document.getElementById('registrationDate');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    dateInput.value = `${year}-${month}-${day}`;
  }
}

/**
 * Add input field animations (optional)
 */
function addInputAnimations() {
  const inputFields = document.querySelectorAll('input, select, textarea');

  inputFields.forEach(field => {
    field.addEventListener('focus', function() {
      const parent = this.parentElement;
      if (parent) {
        parent.classList.add('ring-2', 'ring-yellow-400');
      }
    });

    field.addEventListener('blur', function() {
      const parent = this.parentElement;
      if (parent) {
        parent.classList.remove('ring-2', 'ring-yellow-400');
      }
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  initSignupValidation();
  addInputAnimations();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateEmail,
    validatePassword,
    VALIDATION,
    initSignupValidation
  };
}

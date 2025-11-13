/**
 * Login Page JavaScript
 * Handles admin authentication
 */

// Use credentials from config (will be replaced with API call in Phase 2)
const hardcodedAccount = {
  email: CONFIG?.AUTH?.ADMIN_EMAIL || 'admin@gmail.com',
  password: CONFIG?.AUTH?.ADMIN_PASSWORD || 'admin'
};

// Initialize login functionality
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  const togglePassword = document.getElementById('togglePassword');

  // Handle form submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    loginError.classList.add('hidden');

    if (
      emailInput.value === hardcodedAccount.email &&
      passwordInput.value === hardcodedAccount.password
    ) {
      // Success: redirect to admin dashboard
      window.location.href = 'view_table_mahasiswa.html';
    } else {
      // Show error message
      loginError.classList.remove('hidden');
    }
  });

  // Show/hide password functionality
  togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle eye icon
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
  });
});

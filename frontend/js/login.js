/**
 * Login Page JavaScript
 * Handles admin authentication with JWT
 */

// Initialize login functionality
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  const loginBtn = loginForm?.querySelector('button[type="submit"]');
  const togglePassword = document.getElementById('togglePassword');

  // Check if already logged in
  const token = localStorage.getItem('authToken');
  if (token) {
    verifyTokenAndRedirect(token);
  }

  // Handle form submission
  loginForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    loginError.classList.add('hidden');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Email dan password harus diisi');
      return;
    }

    // Disable button and show loading state
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Sedang login...';
    }

    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Email atau password salah');
        return;
      }

      // Save token to localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminId', data.data.adminId);

        // Redirect to dashboard
        window.location.href = 'view_table_mahasiswa.html';
      } else {
        showError('Token tidak diterima dari server');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Terjadi kesalahan: ' + error.message);
    } finally {
      // Restore button state
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    }
  });

  // Show/hide password functionality
  togglePassword?.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle eye icon
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
  });

  // Helper function to show error
  function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }

  // Helper function to verify token and redirect if valid
  async function verifyTokenAndRedirect(token) {
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Token is valid, redirect to dashboard
        window.location.href = 'view_table_mahasiswa.html';
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminId');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('authToken');
    }
  }
});

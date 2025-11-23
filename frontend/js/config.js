/**
 * Application Configuration & Constants
 * Centralized configuration for the Library Membership System
 */

const CONFIG = {
  // ============================================
  // APPLICATION INFO
  // ============================================
  APP_NAME: 'Perpustakaan Universitas Negeri Malang',
  APP_VERSION: '1.0.0',

  // ============================================
  // CONTACT INFORMATION
  // ============================================
  CONTACT: {
    ADDRESS: 'Jl. Semarang 5 Malang 65145 Jawa Timur – Indonesia',
    PHONE: '(0341) 571035',
    EMAIL: 'library@um.ac.id',
    HOURS: {
      WEEKDAY: '08.00 WIB - 15.00 WIB',
      SATURDAY: '09.00 WIB - 14:00 WIB',
      CLOSED_DAYS: ['Sunday', 'Public Holidays']
    }
  },

  // ============================================
  // VALIDATION RULES
  // ============================================
  VALIDATION: {
    EMAIL_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    MIN_PASSWORD_LENGTH: 6,
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 100,
    PHONE_REGEX: /^[0-9\-\+\(\)\s]{7,}$/,
  },

  // ============================================
  // FILE UPLOAD SETTINGS
  // ============================================
  FILE_UPLOAD: {
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
    PHOTO_DIMENSIONS: {
      WIDTH: '2x3 cm',
      DESCRIPTION: 'Pas foto 2x3 (JPG/PNG)'
    }
  },

  // ============================================
  // FORM MESSAGES (Indonesian)
  // ============================================
  MESSAGES: {
    SUCCESS: {
      REGISTRATION: 'Pendaftaran berhasil! Anda akan menerima email konfirmasi segera.',
      APPROVED: 'Data mahasiswa telah disetujui!',
      REJECTED: 'Pendaftaran ditolak.',
      RENEWED: 'Permintaan perpanjangan berhasil diajukan.'
    },
    ERROR: {
      INVALID_EMAIL: 'Tolong masukkan alamat email yang valid',
      PASSWORD_TOO_SHORT: 'Kata sandi harus minimal 6 karakter',
      LOGIN_FAILED: 'Email atau kata sandi salah',
      MISSING_SIGNATURE: 'Silakan masukkan tanda tangan dan tekan "Simpan TTD" sebelum mengirim formulir',
      MISSING_REQUIRED_FIELDS: 'Silakan isi semua field yang wajib diisi',
      TERMS_REQUIRED: 'Anda harus menyetujui syarat dan ketentuan',
      REQUIREMENTS_REQUIRED: 'Anda harus mengkonfirmasi memenuhi persyaratan'
    },
    CONFIRM: {
      REJECT: 'Tolak pendaftaran ini? Tindakan ini akan membatalkan pendaftaran.',
      REJECT_RENEWAL: 'Tolak permintaan perpanjangan ini?'
    }
  },

  // ============================================
  // API ENDPOINTS
  // ============================================
  API: {
    BASE_URL: 'http://16.78.150.77:3000/api',
    ENDPOINTS: {
      // Auth
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',

      // Members
      REGISTER: '/members/register',
      GET_MEMBER: '/members/:id',
      UPDATE_MEMBER: '/members/:id',
      GET_ALL_MEMBERS: '/members',
      SEARCH_MEMBERS: '/members/search',

      // Admin Actions
      APPROVE_MEMBER: '/members/:id/approve',
      REJECT_MEMBER: '/members/:id/reject',
      RENEW_MEMBER: '/members/:id/renew',

      // Dashboard
      STATS: '/dashboard/stats'
    }
  },

  // ============================================
  // MEMBER STATUS CONSTANTS
  // ============================================
  MEMBER_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },

  // ============================================
  // UI/UX CONSTANTS
  // ============================================
  UI: {
    DATE_FORMAT: 'DD/MM/YYYY',
    DAYS_IN_WEEK: 7,
    DAYS_IN_MONTH: 30,
    INDONESIAN_DAYS: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    GENDER_OPTIONS: {
      MALE: { value: 'male', label: 'Laki-laki' },
      FEMALE: { value: 'female', label: 'Perempuan' }
    }
  }
};

// Export for use in Node.js/module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

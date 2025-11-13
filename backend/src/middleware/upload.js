/**
 * Multer Configuration for File Uploads
 * Handles: photo, signature, payment_proof
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

// Create uploads directories if they don't exist
const dirs = [
  path.join(uploadsDir, 'photos'),
  path.join(uploadsDir, 'signatures'),
  path.join(uploadsDir, 'payments')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================
// PHOTO UPLOAD CONFIG
// ============================================
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'photos'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    cb(null, `photo-${timestamp}-${random}${path.extname(file.originalname)}`);
  }
});

const photoFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya format JPG, PNG, atau WEBP yang diizinkan untuk foto'));
  }
};

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ============================================
// SIGNATURE UPLOAD CONFIG
// ============================================
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'signatures'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    cb(null, `signature-${timestamp}-${random}${path.extname(file.originalname)}`);
  }
});

const signatureFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya format PNG atau JPG yang diizinkan untuk tanda tangan'));
  }
};

export const uploadSignature = multer({
  storage: signatureStorage,
  fileFilter: signatureFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// ============================================
// PAYMENT PROOF UPLOAD CONFIG
// ============================================
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsDir, 'payments'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    cb(null, `payment-${timestamp}-${random}${path.extname(file.originalname)}`);
  }
});

const paymentFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya format JPG, PNG, atau PDF yang diizinkan untuk bukti pembayaran'));
  }
};

export const uploadPayment = multer({
  storage: paymentStorage,
  fileFilter: paymentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ============================================
// COMBINED UPLOAD (for multiple files)
// ============================================
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let dir = uploadsDir;
      if (file.fieldname === 'photo') {
        dir = path.join(uploadsDir, 'photos');
      } else if (file.fieldname === 'signature') {
        dir = path.join(uploadsDir, 'signatures');
      } else if (file.fieldname === 'paymentProof') {
        dir = path.join(uploadsDir, 'payments');
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      cb(null, `${file.fieldname}-${timestamp}-${random}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = {
      photo: ['image/jpeg', 'image/png', 'image/webp'],
      signature: ['image/png', 'image/jpeg'],
      paymentProof: ['image/jpeg', 'image/png', 'application/pdf']
    };

    const allowed = allowedMimes[file.fieldname] || [];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Format file tidak diizinkan untuk ${file.fieldname}`));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

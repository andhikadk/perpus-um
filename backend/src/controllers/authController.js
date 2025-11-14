/**
 * Auth Controller
 * Handles authentication operations
 */

import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// ============================================
// LOGIN ADMIN
// ============================================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Email dan password harus diisi', 400);
    }

    // Get admin from database
    const connection = await pool.getConnection();
    const [admins] = await connection.query(
      'SELECT id, email, password FROM admins WHERE email = ?',
      [email]
    );
    connection.release();

    // Check if admin exists
    if (admins.length === 0) {
      return errorResponse(res, 'Email atau password salah', 401);
    }

    const admin = admins[0];

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return errorResponse(res, 'Email atau password salah', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return successResponse(
      res,
      { token, adminId: admin.id, email: admin.email },
      'Login berhasil',
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat login', 500, error.message);
  }
};

// ============================================
// VERIFY TOKEN
// ============================================
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Token tidak ditemukan', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return successResponse(res, decoded, 'Token valid');
  } catch (error) {
    console.error('Token verification error:', error);
    return errorResponse(res, 'Token tidak valid atau sudah expired', 401, error.message);
  }
};

// ============================================
// LOGOUT (Frontend only - just removes token from localStorage)
// ============================================
export const logoutAdmin = async (req, res) => {
  try {
    return successResponse(res, {}, 'Logout berhasil');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat logout', 500, error.message);
  }
};

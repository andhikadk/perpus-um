/**
 * Member Controller
 * Handles all member-related operations
 */

import pool from '../config/database.js';
import { successResponse, errorResponse, validationError } from '../utils/responseHandler.js';
import { sendRegistrationConfirmation, sendApprovalEmail, sendRejectionEmail, sendRenewalApprovalEmail, sendRenewalRejectionEmail } from '../services/emailService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// REGISTER NEW MEMBER
// ============================================
export const registerMember = async (req, res) => {
  try {
    const {
      name,
      nim,
      email,
      birthPlace,
      birthDate,
      gender,
      address,
      phone,
      institution,
      profession,
      program,
      registrationDate
    } = req.body;

    // Validate required fields
    const errors = {};
    if (!name) errors.name = 'Nama harus diisi';
    if (!nim) errors.nim = 'NIM/NIK harus diisi';
    if (!email) errors.email = 'Email harus diisi';
    if (!institution) errors.institution = 'Asal institusi harus diisi';

    if (Object.keys(errors).length > 0) {
      return validationError(res, errors);
    }

    // Check if NIM or email already exists
    const connection = await pool.getConnection();
    const [existingMembers] = await connection.query(
      'SELECT id FROM members WHERE nim = ? OR email = ?',
      [nim, email]
    );

    if (existingMembers.length > 0) {
      connection.release();
      return errorResponse(res, 'NIM atau email sudah terdaftar', 409);
    }

    // Get file paths from Multer
    const photoPath = req.files?.photo?.[0]?.path ? `/uploads/photos/${req.files.photo[0].filename}` : null;
    const paymentProofPath = req.files?.paymentProof?.[0]?.path ? `/uploads/payments/${req.files.paymentProof[0].filename}` : null;

    // Handle signature - can be either file upload or base64 data URL from canvas
    let signaturePath = req.files?.signature?.[0]?.path ? `/uploads/signatures/${req.files.signature[0].filename}` : null;

    // If signature is provided as base64 data URL from canvas
    if (!signaturePath && req.body.signature) {
      const signatureData = req.body.signature;
      // Check if it's a data URL (base64)
      if (signatureData.startsWith('data:image')) {
        try {
          // Convert base64 to file and save
          const base64Data = signatureData.replace(/^data:image\/(png|jpeg);base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000);
          const filename = `signature-${timestamp}-${random}.png`;
          const filepath = path.join(__dirname, `../../uploads/signatures/${filename}`);

          // Create directory if not exists
          const dir = path.dirname(filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filepath, buffer);
          signaturePath = `/uploads/signatures/${filename}`;
        } catch (err) {
          console.error('Error saving signature:', err);
          // Continue without signature if error
        }
      }
    }

    // Insert into database
    const [result] = await connection.query(
      `INSERT INTO members
        (name, nim, email, birth_place, birth_date, gender, address, phone,
         institution, profession, program, photo_path, signature_path, payment_proof_path, registration_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        nim,
        email,
        birthPlace || null,
        birthDate || null,
        gender || null,
        address || null,
        phone || null,
        institution,
        profession || null,
        program || null,
        photoPath,
        signaturePath,
        paymentProofPath,
        registrationDate || new Date().toISOString().split('T')[0]
      ]
    );

    connection.release();

    // After successful insertion and before sending response
    const memberData = {
      name: name,
      email: email,
      registration_date: registrationDate
    };

    // Send confirmation email (non-blocking)
    sendRegistrationConfirmation(memberData).catch(err => {
      console.error('Failed to send registration confirmation email:', err);
      // Don't fail the registration if email fails
    });

    return successResponse(
      res,
      { id: result.insertId, nim, email },
      'Pendaftaran berhasil! Anda akan menerima email konfirmasi segera.',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mendaftar', 500, error.message);
  }
};

// ============================================
// GET ALL MEMBERS (Admin)
// ============================================
export const getAllMembers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [members] = await connection.query(
      'SELECT * FROM members ORDER BY created_at DESC'
    );
    connection.release();

    return successResponse(res, members, 'Data anggota berhasil diambil');
  } catch (error) {
    console.error('Get members error:', error);
    return errorResponse(res, 'Gagal mengambil data anggota', 500, error.message);
  }
};

// ============================================
// GET MEMBER BY ID
// ============================================
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [members] = await connection.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );
    connection.release();

    if (members.length === 0) {
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    return successResponse(res, members[0], 'Data anggota berhasil diambil');
  } catch (error) {
    console.error('Get member error:', error);
    return errorResponse(res, 'Gagal mengambil data anggota', 500, error.message);
  }
};

// ============================================
// SEARCH MEMBERS
// ============================================
export const searchMembers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return errorResponse(res, 'Query pencarian harus diisi', 400);
    }

    const connection = await pool.getConnection();
    const [members] = await connection.query(
      `SELECT * FROM members
       WHERE name LIKE ? OR nim LIKE ? OR email LIKE ?
       ORDER BY created_at DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    connection.release();

    return successResponse(res, members, 'Hasil pencarian anggota');
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse(res, 'Gagal mencari anggota', 500, error.message);
  }
};

// ============================================
// APPROVE MEMBER (Admin)
// ============================================
export const approveMember = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Calculate membership expiry date (1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryDateString = expiryDate.toISOString().split('T')[0];

    // Update member status and set expiry date
    const [result] = await connection.query(
      'UPDATE members SET status = ?, approved_at = NOW(), membership_expiry_date = ? WHERE id = ?',
      ['approved', expiryDateString, id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    // Fetch member data to send email
    const [members] = await connection.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    connection.release();

    const member = members[0];

    // Send approval email (non-blocking)
    sendApprovalEmail(member).catch(err => {
      console.error('Failed to send approval email:', err);
    });

    return successResponse(
      res,
      { id },
      'Anggota berhasil disetujui. Email notifikasi telah dikirim.'
    );
  } catch (error) {
    console.error('Approve error:', error);
    return errorResponse(res, 'Gagal menyetujui anggota', 500, error.message);
  }
};

// ============================================
// REJECT MEMBER (Admin)
// ============================================
export const rejectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const connection = await pool.getConnection();

    // Update member status with rejection reason
    const [result] = await connection.query(
      'UPDATE members SET status = ?, rejected_at = NOW(), rejection_reason = ? WHERE id = ?',
      ['rejected', reason || null, id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    // Fetch member data to send email
    const [members] = await connection.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    connection.release();

    const member = members[0];

    // Send rejection email (non-blocking)
    sendRejectionEmail(member, reason).catch(err => {
      console.error('Failed to send rejection email:', err);
    });

    return successResponse(
      res,
      { id },
      'Pendaftaran anggota ditolak. Email pemberitahuan telah dikirim.'
    );
  } catch (error) {
    console.error('Reject error:', error);
    return errorResponse(res, 'Gagal menolak anggota', 500, error.message);
  }
};

// ============================================
// GET DASHBOARD STATISTICS
// ============================================
export const getDashboardStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get various stats
    const [totalStats] = await connection.query(
      'SELECT COUNT(*) as total FROM members'
    );

    const [approvedStats] = await connection.query(
      'SELECT COUNT(*) as approved FROM members WHERE status = "approved"'
    );

    const [pendingStats] = await connection.query(
      'SELECT COUNT(*) as pending FROM members WHERE status = "pending"'
    );

    const [rejectedStats] = await connection.query(
      'SELECT COUNT(*) as rejected FROM members WHERE status = "rejected"'
    );

    const [newStats] = await connection.query(
      `SELECT COUNT(*) as new FROM members
       WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    connection.release();

    return successResponse(res, {
      total: totalStats[0].total,
      approved: approvedStats[0].approved,
      pending: pendingStats[0].pending,
      rejected: rejectedStats[0].rejected,
      newRegistrations: newStats[0].new
    }, 'Statistik dashboard');
  } catch (error) {
    console.error('Stats error:', error);
    return errorResponse(res, 'Gagal mengambil statistik', 500, error.message);
  }
};

// ============================================
// REQUEST MEMBERSHIP RENEWAL
// ============================================
export const requestRenewal = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if member exists and get full data
    const [members] = await connection.query(
      'SELECT id, email, name, status, membership_expiry_date FROM members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      connection.release();
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    const member = members[0];

    // Validate member status must be approved
    if (member.status !== 'approved') {
      connection.release();
      return errorResponse(res, 'Hanya anggota yang disetujui dapat perpanjangan. Status Anda: ' + member.status, 400);
    }

    // Validate membership has expired or about to expire (within 30 days)
    if (member.membership_expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(member.membership_expiry_date);
      expiryDate.setHours(0, 0, 0, 0);

      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiryDate > thirtyDaysFromNow) {
        connection.release();
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return errorResponse(res, `Keanggotaan Anda masih berlaku untuk ${daysLeft} hari ke depan. Perpanjangan dapat dilakukan 30 hari sebelum masa berlaku berakhir.`, 400);
      }
    }

    // Insert renewal request
    const [result] = await connection.query(
      'INSERT INTO renewals (member_id, request_date, status) VALUES (?, NOW(), ?)',
      [id, 'pending']
    );

    connection.release();

    return successResponse(
      res,
      { renewalId: result.insertId },
      'Permintaan perpanjangan berhasil diajukan. Tunggu persetujuan dari admin.',
      201
    );
  } catch (error) {
    console.error('Renewal request error:', error);
    return errorResponse(res, 'Gagal mengajukan perpanjangan', 500, error.message);
  }
};

// ============================================
// GET ALL RENEWAL REQUESTS
// ============================================
export const getRenewals = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [renewals] = await connection.query(
      `SELECT r.*, m.name, m.email, m.nim
       FROM renewals r
       JOIN members m ON r.member_id = m.id
       ORDER BY r.request_date DESC`
    );

    connection.release();

    return successResponse(res, renewals, 'Data permintaan perpanjangan');
  } catch (error) {
    console.error('Get renewals error:', error);
    return errorResponse(res, 'Gagal mengambil data perpanjangan', 500, error.message);
  }
};

// ============================================
// APPROVE RENEWAL REQUEST
// ============================================
export const approveRenewal = async (req, res) => {
  try {
    const { renewalId } = req.params;
    const connection = await pool.getConnection();

    // Get renewal and member data first
    const [renewalData] = await connection.query(
      `SELECT r.*, m.id as member_id, m.membership_expiry_date FROM renewals r
       JOIN members m ON r.member_id = m.id
       WHERE r.id = ?`,
      [renewalId]
    );

    if (renewalData.length === 0) {
      connection.release();
      return errorResponse(res, 'Permintaan perpanjangan tidak ditemukan', 404);
    }

    const renewal = renewalData[0];
    const currentExpiryDate = renewal.membership_expiry_date ? new Date(renewal.membership_expiry_date) : new Date();

    // Calculate new expiry date (extend 1 year from current expiry or from today if expired)
    const newExpiryDate = new Date(currentExpiryDate);
    if (currentExpiryDate < new Date()) {
      // If already expired, count from today
      newExpiryDate.setDate(new Date().getDate());
    }
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    const newExpiryDateString = newExpiryDate.toISOString().split('T')[0];

    // Update renewal status and member expiry date
    const [result] = await connection.query(
      `UPDATE renewals SET status = ?, approved_at = NOW(), new_expiry_date = ? WHERE id = ?`,
      ['approved', newExpiryDateString, renewalId]
    );

    // Update member membership_expiry_date
    await connection.query(
      'UPDATE members SET membership_expiry_date = ? WHERE id = ?',
      [newExpiryDateString, renewal.member_id]
    );

    // Get member data for email
    const [renewals] = await connection.query(
      `SELECT m.* FROM members m
       JOIN renewals r ON r.member_id = m.id
       WHERE r.id = ?`,
      [renewalId]
    );

    connection.release();

    if (renewals.length > 0) {
      const member = renewals[0];

      // Send renewal approval email (non-blocking)
      sendRenewalApprovalEmail(member).catch(err => {
        console.error('Failed to send renewal approval email:', err);
      });
    }

    return successResponse(
      res,
      { renewalId },
      'Perpanjangan berhasil disetujui. Email notifikasi telah dikirim.'
    );
  } catch (error) {
    console.error('Approve renewal error:', error);
    return errorResponse(res, 'Gagal menyetujui perpanjangan', 500, error.message);
  }
};

// ============================================
// REJECT RENEWAL REQUEST
// ============================================
export const rejectRenewal = async (req, res) => {
  try {
    const { renewalId } = req.params;
    const { reason } = req.body;
    const connection = await pool.getConnection();

    // Update renewal status
    const [result] = await connection.query(
      'UPDATE renewals SET status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', reason || null, renewalId]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return errorResponse(res, 'Permintaan perpanjangan tidak ditemukan', 404);
    }

    // Get member data for email
    const [renewals] = await connection.query(
      `SELECT m.* FROM members m
       JOIN renewals r ON r.member_id = m.id
       WHERE r.id = ?`,
      [renewalId]
    );

    connection.release();

    if (renewals.length > 0) {
      const member = renewals[0];

      // Send renewal rejection email (non-blocking)
      sendRenewalRejectionEmail(member, reason).catch(err => {
        console.error('Failed to send renewal rejection email:', err);
      });
    }

    return successResponse(
      res,
      { renewalId },
      'Perpanjangan ditolak. Email pemberitahuan telah dikirim.'
    );
  } catch (error) {
    console.error('Reject renewal error:', error);
    return errorResponse(res, 'Gagal menolak perpanjangan', 500, error.message);
  }
};

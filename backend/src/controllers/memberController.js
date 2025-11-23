/**
 * Member Controller
 * Handles all member-related operations
 */

import pool from '../config/database.js';
import { successResponse, errorResponse, validationError } from '../utils/responseHandler.js';
import { sendRegistrationConfirmation, sendApprovalEmail, sendRejectionEmail, sendRenewalApprovalEmail, sendRenewalRejectionEmail } from '../services/emailService.js';
import { generateMemberNumber, isMemberNumberUnique } from '../utils/memberNumberGenerator.js';
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

    // Generate unique member number
    const regDate = registrationDate ? new Date(registrationDate) : new Date();
    const memberNumber = await generateMemberNumber(regDate);

    // Insert into database
    const [result] = await connection.query(
      `INSERT INTO members
        (member_number, name, nim, email, birth_place, birth_date, gender, address, phone,
         institution, profession, program, photo_path, signature_path, payment_proof_path, registration_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memberNumber,
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
      { id: result.insertId, memberNumber, nim, email },
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

    // First, get member data to retrieve registration_date
    const [memberData] = await connection.query(
      'SELECT registration_date FROM members WHERE id = ?',
      [id]
    );

    if (memberData.length === 0) {
      connection.release();
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    // Calculate membership expiry date (1 month from registration_date)
    const registrationDate = memberData[0].registration_date ? new Date(memberData[0].registration_date) : new Date();
    const expiryDate = new Date(registrationDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
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

    // Active members: approved AND (not expired OR no expiry date set)
    const [activeStats] = await connection.query(
      `SELECT COUNT(*) as active FROM members
       WHERE status = "approved"
       AND (membership_expiry_date >= CURDATE() OR membership_expiry_date IS NULL)`
    );

    // Inactive members: pending, rejected, or expired approved members
    const [inactiveStats] = await connection.query(
      `SELECT COUNT(*) as inactive FROM members
       WHERE status IN ("pending", "rejected")
       OR (status = "approved" AND membership_expiry_date < CURDATE())`
    );

    // New registrations in last 7 days
    const [newStats] = await connection.query(
      `SELECT COUNT(*) as new FROM members
       WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    connection.release();

    return successResponse(res, {
      total: totalStats[0].total,
      active: activeStats[0].active,
      inactive: inactiveStats[0].inactive,
      newRegistrations: newStats[0].new
    }, 'Statistik dashboard');
  } catch (error) {
    console.error('Stats error:', error);
    return errorResponse(res, 'Gagal mengambil statistik', 500, error.message);
  }
};

// ============================================
// GET PROFESSION STATISTICS
// ============================================
export const getProfessionStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get profession statistics for approved members only
    const [professionStats] = await connection.query(
      `SELECT profession, COUNT(*) as count
       FROM members
       WHERE status = "approved" AND profession IN ("Mahasiswa", "Umum")
       GROUP BY profession`
    );

    connection.release();

    // Format the result for pie chart
    const result = {
      Mahasiswa: 0,
      Umum: 0
    };

    professionStats.forEach(stat => {
      if (stat.profession === 'Mahasiswa' || stat.profession === 'Umum') {
        result[stat.profession] = stat.count;
      }
    });

    return successResponse(res, result, 'Statistik profesi');
  } catch (error) {
    console.error('Profession stats error:', error);
    return errorResponse(res, 'Gagal mengambil statistik profesi', 500, error.message);
  }
};

// ============================================
// GET REGISTRATION TREND (for line chart)
// ============================================
export const getRegistrationTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to 30 days
    const numDays = parseInt(days);

    if (isNaN(numDays) || numDays < 1 || numDays > 365) {
      return errorResponse(res, 'Parameter days harus antara 1-365', 400);
    }

    const connection = await pool.getConnection();

    // Get registration counts grouped by date for the last N days
    const [trendData] = await connection.query(
      `SELECT DATE(registration_date) as date, COUNT(*) as count
       FROM members
       WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(registration_date)
       ORDER BY date ASC`,
      [numDays]
    );

    connection.release();

    // Create complete date range with 0 counts for missing dates
    const result = [];
    const dateMap = new Map();

    // Map existing data
    trendData.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      dateMap.set(dateStr, row.count);
    });

    // Fill all dates in range
    const today = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      result.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0
      });
    }

    return successResponse(res, result, 'Tren pendaftaran');
  } catch (error) {
    console.error('Registration trend error:', error);
    return errorResponse(res, 'Gagal mengambil tren pendaftaran', 500, error.message);
  }
};

// ============================================
// REQUEST MEMBERSHIP RENEWAL
// ============================================
export const requestRenewal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
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

    // Validate membership has already expired (not just expiring soon)
    if (member.membership_expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(member.membership_expiry_date);
      expiryDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      // Only allow renewal if membership has already expired
      if (daysLeft >= 0) {
        connection.release();
        if (daysLeft === 0) {
          return errorResponse(res, 'Keanggotaan Anda berakhir hari ini. Perpanjangan hanya dapat dilakukan setelah masa berlaku berakhir (mulai besok).', 400);
        } else {
          return errorResponse(res, `Keanggotaan Anda masih berlaku untuk ${daysLeft} hari ke depan. Perpanjangan hanya dapat dilakukan setelah masa berlaku berakhir.`, 400);
        }
      }
    }

    // Validate payment proof upload
    if (!req.files || !req.files.paymentProof || req.files.paymentProof.length === 0) {
      connection.release();
      return errorResponse(res, 'Bukti transfer wajib diunggah', 400);
    }

    // Get payment proof file path
    const paymentProofPath = `/uploads/payments/${req.files.paymentProof[0].filename}`;

    // Insert renewal request with payment proof
    const [result] = await connection.query(
      'INSERT INTO renewals (member_id, payment_proof_path, request_date, status) VALUES (?, ?, NOW(), ?)',
      [id, paymentProofPath, 'pending']
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

    // Calculate new expiry date (extend 1 month from current expiry or from today if expired)
    const newExpiryDate = new Date(currentExpiryDate);
    if (currentExpiryDate < new Date()) {
      // If already expired, count from today
      newExpiryDate.setDate(new Date().getDate());
    }
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
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

// ============================================
// UPDATE MEMBER (Admin)
// ============================================
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      memberNumber,
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

    const connection = await pool.getConnection();

    // Check if member exists
    const [members] = await connection.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      connection.release();
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    const currentMember = members[0];

    // Validate required fields
    const errors = {};
    if (!name) errors.name = 'Nama harus diisi';
    if (!nim) errors.nim = 'NIM/NIK harus diisi';
    if (!email) errors.email = 'Email harus diisi';
    if (!institution) errors.institution = 'Asal institusi harus diisi';

    if (Object.keys(errors).length > 0) {
      connection.release();
      return validationError(res, errors);
    }

    // Check if member_number is unique (if changed)
    if (memberNumber && memberNumber !== currentMember.member_number) {
      const isUnique = await isMemberNumberUnique(memberNumber, id);
      if (!isUnique) {
        connection.release();
        return errorResponse(res, 'Nomor anggota sudah digunakan', 409);
      }
    }

    // Check if NIM is unique (if changed)
    if (nim !== currentMember.nim) {
      const [existingNim] = await connection.query(
        'SELECT id FROM members WHERE nim = ? AND id != ?',
        [nim, id]
      );
      if (existingNim.length > 0) {
        connection.release();
        return errorResponse(res, 'NIM sudah terdaftar', 409);
      }
    }

    // Check if email is unique (if changed)
    if (email !== currentMember.email) {
      const [existingEmail] = await connection.query(
        'SELECT id FROM members WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existingEmail.length > 0) {
        connection.release();
        return errorResponse(res, 'Email sudah terdaftar', 409);
      }
    }

    // Handle file uploads if provided
    let photoPath = currentMember.photo_path;
    let signaturePath = currentMember.signature_path;
    let paymentProofPath = currentMember.payment_proof_path;

    // Update photo if new file uploaded
    if (req.files?.photo?.[0]) {
      photoPath = `/uploads/photos/${req.files.photo[0].filename}`;
      // Delete old photo if exists
      if (currentMember.photo_path) {
        const oldPath = path.join(__dirname, '../../', currentMember.photo_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // Update payment proof if new file uploaded
    if (req.files?.paymentProof?.[0]) {
      paymentProofPath = `/uploads/payments/${req.files.paymentProof[0].filename}`;
      // Delete old payment proof if exists
      if (currentMember.payment_proof_path) {
        const oldPath = path.join(__dirname, '../../', currentMember.payment_proof_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // Update signature if new file uploaded or base64 provided
    if (req.files?.signature?.[0]) {
      signaturePath = `/uploads/signatures/${req.files.signature[0].filename}`;
      // Delete old signature if exists
      if (currentMember.signature_path) {
        const oldPath = path.join(__dirname, '../../', currentMember.signature_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    } else if (req.body.signature && req.body.signature.startsWith('data:image')) {
      try {
        const base64Data = req.body.signature.replace(/^data:image\/(png|jpeg);base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const filename = `signature-${timestamp}-${random}.png`;
        const filepath = path.join(__dirname, `../../uploads/signatures/${filename}`);

        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filepath, buffer);

        // Delete old signature if exists
        if (currentMember.signature_path) {
          const oldPath = path.join(__dirname, '../../', currentMember.signature_path);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        signaturePath = `/uploads/signatures/${filename}`;
      } catch (err) {
        console.error('Error saving signature:', err);
      }
    }

    // Update member in database
    const [result] = await connection.query(
      `UPDATE members SET
        member_number = ?,
        name = ?,
        nim = ?,
        email = ?,
        birth_place = ?,
        birth_date = ?,
        gender = ?,
        address = ?,
        phone = ?,
        institution = ?,
        profession = ?,
        program = ?,
        photo_path = ?,
        signature_path = ?,
        payment_proof_path = ?,
        registration_date = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        memberNumber || currentMember.member_number,
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
        registrationDate || currentMember.registration_date,
        id
      ]
    );

    connection.release();

    return successResponse(
      res,
      { id, memberNumber: memberNumber || currentMember.member_number },
      'Data anggota berhasil diperbarui'
    );
  } catch (error) {
    console.error('Update member error:', error);
    return errorResponse(res, 'Gagal memperbarui data anggota', 500, error.message);
  }
};

// ============================================
// DELETE MEMBER (Admin)
// ============================================
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // First, get member data to delete associated files
    const [members] = await connection.query(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      connection.release();
      return errorResponse(res, 'Anggota tidak ditemukan', 404);
    }

    const member = members[0];

    // Delete associated files from filesystem
    const filesToDelete = [
      member.photo_path,
      member.signature_path,
      member.payment_proof_path
    ].filter(Boolean); // Remove null/undefined values

    filesToDelete.forEach(filePath => {
      try {
        // Convert relative path to absolute path
        const absolutePath = path.join(__dirname, '../../', filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`Deleted file: ${absolutePath}`);
        }
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
        // Continue even if file deletion fails
      }
    });

    // Delete member from database
    const [result] = await connection.query(
      'DELETE FROM members WHERE id = ?',
      [id]
    );

    connection.release();

    return successResponse(
      res,
      { id },
      'Anggota berhasil dihapus'
    );
  } catch (error) {
    console.error('Delete member error:', error);
    return errorResponse(res, 'Gagal menghapus anggota', 500, error.message);
  }
};

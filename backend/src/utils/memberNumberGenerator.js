/**
 * Member Number Generator Utility
 * Generates unique member numbers in format: UM-YYYYMMDD-XXXX
 */

import pool from '../config/database.js';

/**
 * Generate a unique member number
 * Format: UM-YYYYMMDD-XXXX
 * Example: UM-20241115-0001
 *
 * @param {Date} registrationDate - Registration date for the member (optional, defaults to today)
 * @returns {Promise<string>} - Unique member number
 */
export async function generateMemberNumber(registrationDate = new Date()) {
  const connection = await pool.getConnection();

  try {
    // Format date as YYYYMMDD
    const year = registrationDate.getFullYear();
    const month = String(registrationDate.getMonth() + 1).padStart(2, '0');
    const day = String(registrationDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    // Get the highest sequence number for today
    const [rows] = await connection.query(
      `SELECT member_number
       FROM members
       WHERE member_number LIKE ?
       ORDER BY member_number DESC
       LIMIT 1`,
      [`UM-${datePrefix}-%`]
    );

    let sequenceNumber = 1;

    if (rows.length > 0) {
      // Extract sequence number from last member number
      const lastNumber = rows[0].member_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }

    // Format sequence number with leading zeros (4 digits)
    const formattedSequence = String(sequenceNumber).padStart(4, '0');

    // Generate final member number
    const memberNumber = `UM-${datePrefix}-${formattedSequence}`;

    return memberNumber;
  } finally {
    connection.release();
  }
}

/**
 * Validate if a member number is unique
 *
 * @param {string} memberNumber - Member number to validate
 * @param {number} excludeMemberId - Member ID to exclude from check (for updates)
 * @returns {Promise<boolean>} - True if unique, false otherwise
 */
export async function isMemberNumberUnique(memberNumber, excludeMemberId = null) {
  const connection = await pool.getConnection();

  try {
    let query = 'SELECT COUNT(*) as count FROM members WHERE member_number = ?';
    let params = [memberNumber];

    if (excludeMemberId) {
      query += ' AND id != ?';
      params.push(excludeMemberId);
    }

    const [rows] = await connection.query(query, params);

    return rows[0].count === 0;
  } finally {
    connection.release();
  }
}

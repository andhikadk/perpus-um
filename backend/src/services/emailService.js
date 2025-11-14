/**
 * Email Service
 * Handles sending emails for various notification events
 */

import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTransporter } from '../config/email.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Render email template with data
 */
export const renderTemplate = (templateName, data) => {
  return new Promise((resolve, reject) => {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.ejs`);
    const baseTemplatePath = path.join(__dirname, '../templates/emails/base.ejs');

    // First render the specific template
    ejs.renderFile(templatePath, data, (err, html) => {
      if (err) {
        return reject(err);
      }

      // Then wrap it in the base template
      ejs.renderFile(baseTemplatePath, { body: html }, (err, finalHtml) => {
        if (err) {
          return reject(err);
        }
        resolve(finalHtml);
      });
    });
  });
};

/**
 * Send email helper function
 */
export const sendEmail = async (to, subject, templateName, data) => {
  try {
    const transporter = await getTransporter();

    // Render HTML template
    const html = await renderTemplate(templateName, data);

    // Send email
    const info = await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: subject,
      html: html
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send registration confirmation email
 */
export const sendRegistrationConfirmation = async (member) => {
  const subject = 'Konfirmasi Pendaftaran Keanggotaan - Perpustakaan UM';
  const data = {
    name: member.name,
    email: member.email,
    registrationDate: new Date(member.registration_date).toLocaleDateString('id-ID')
  };

  return sendEmail(member.email, subject, 'register-confirmation', data);
};

/**
 * Send approval notification email
 */
export const sendApprovalEmail = async (member) => {
  const subject = 'Pendaftaran Anda Telah Disetujui - Perpustakaan UM';
  const data = {
    name: member.name,
    nim: member.nim,
    email: member.email,
    approvalDate: new Date(member.approved_at).toLocaleDateString('id-ID')
  };

  return sendEmail(member.email, subject, 'approved', data);
};

/**
 * Send rejection notification email
 */
export const sendRejectionEmail = async (member, rejectionReason = null) => {
  const subject = 'Pemberitahuan Status Pendaftaran - Perpustakaan UM';
  const data = {
    name: member.name,
    email: member.email,
    rejectionDate: new Date(member.rejected_at).toLocaleDateString('id-ID'),
    rejectionReason: rejectionReason || member.rejection_reason
  };

  return sendEmail(member.email, subject, 'rejected', data);
};

/**
 * Send renewal approval email
 */
export const sendRenewalApprovalEmail = async (member) => {
  const subject = 'Perpanjangan Keanggotaan Disetujui - Perpustakaan UM';
  const data = {
    name: member.name,
    nim: member.nim,
    renewalDate: new Date().toLocaleDateString('id-ID')
  };

  return sendEmail(member.email, subject, 'renewal-approved', data);
};

/**
 * Send renewal rejection email
 */
export const sendRenewalRejectionEmail = async (member, rejectionReason = null) => {
  const subject = 'Pemberitahuan Perpanjangan Keanggotaan - Perpustakaan UM';
  const data = {
    name: member.name,
    nim: member.nim,
    renewalDate: new Date().toLocaleDateString('id-ID'),
    rejectionReason: rejectionReason
  };

  return sendEmail(member.email, subject, 'renewal-rejected', data);
};
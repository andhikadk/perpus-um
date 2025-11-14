/**
 * Email Configuration & Service Setup
 * Handles SMTP connection and email sending
 */

import nodemailer from 'nodemailer';

// Create transporter based on environment
const createTransporter = () => {
    // If SMTP config exists in .env, use it (both production and development)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        console.log(`📧 Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
        return Promise.resolve(nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }));
    }

    // Fallback: If no SMTP config, show error
    console.warn('⚠️  SMTP configuration not found in .env. Email sending disabled.');
    return Promise.resolve({
        sendMail: (options, callback) => {
            console.warn('❌ Email service not configured. Email not sent:', options.subject);
            if (callback) callback(null, { messageId: 'MOCK' });
        }
    });
};

let transporter = null;

// Initialize transporter
export const initializeTransporter = async () => {
    transporter = await createTransporter();
    return transporter;
};

// Get transporter (ensure initialized)
export const getTransporter = async () => {
    if (!transporter) {
        await initializeTransporter();
    }
    return transporter;
};

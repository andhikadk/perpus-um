/**
 * Email Configuration & Service Setup
 * Handles SMTP connection and email sending
 */

const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production: Use Gmail OAuth or SMTP service
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        // Development: Use Ethereal (fake SMTP for testing)
        return nodemailer.createTestAccount()
            .then(testAccount => {
                return nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
            })
            .catch(err => {
                console.error('Failed to create test account:', err);
                // Fallback to null transporter (no-op)
                return {
                    sendMail: (options, callback) => {
                        console.warn('Email service not configured. Email not sent:', options.subject);
                        if (callback) callback(null, { messageId: 'MOCK' });
                    }
                };
            });
    }
};

let transporter = null;

// Initialize transporter
const initializeTransporter = async () => {
    transporter = await createTransporter();
    return transporter;
};

// Get transporter (ensure initialized)
const getTransporter = async () => {
    if (!transporter) {
        await initializeTransporter();
    }
    return transporter;
};

module.exports = {
    getTransporter,
    initializeTransporter
};
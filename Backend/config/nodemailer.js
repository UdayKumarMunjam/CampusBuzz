import nodemailer from 'nodemailer';

// Create transporter for real email sending
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // For development - remove in production
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email service error:', error.message);
    console.log('❌ Please check your EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS in .env');
  } else {
    console.log('✅ Email service is ready to send messages');
    console.log(`📧 Using SMTP: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  }
});

export default transporter;
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `"${process.env.FROM_NAME || 'Grocery System'}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // सादा मोबाइलको लागि
    html: options.html,    // ⚠️ IMPORTANT: यो लाइनले गर्दा बल्ल डिजाइन जान्छ
    attachments: options.attachments || [] // Add this line for PDF support
  };

  try {
    console.log(`[EMAIL] Attempting to send to: ${options.email}`);
    const info = await transporter.sendMail(message);
    console.log(`[EMAIL] Success! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL] FAILED to send to ${options.email}`);
    console.error(`[EMAIL] Error Reason: ${error.message}`);
    throw error; // Rethrow so the controller can handle it
  }
};

module.exports = sendEmail;
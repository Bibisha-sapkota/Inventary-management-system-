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
    html: options.html     // ⚠️ IMPORTANT: यो लाइनले गर्दा बल्ल डिजाइन जान्छ
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
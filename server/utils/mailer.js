const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP credentials not fully provided. Email notifications disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error('Failed to verify mail transporter:', error);
    } else {
      console.log('Mail transporter ready');
    }
  });

  transporter.defaultFrom = SMTP_FROM || SMTP_USER;

  return transporter;
};

exports.sendMail = async ({
  to,
  subject,
  html,
  text,
}) => {
  const mailer = getTransporter();
  if (!mailer) {
    return false;
  }

  try {
    await mailer.sendMail({
      from: mailer.defaultFrom,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};



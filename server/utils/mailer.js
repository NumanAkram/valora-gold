const nodemailer = require('nodemailer');

let transporter = null;

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  return fallback;
};

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
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_FROM,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
  } = process.env;

  const host = SMTP_HOST || EMAIL_HOST || 'smtp.gmail.com';
  const user = SMTP_USER || EMAIL_USER || GMAIL_USER;
  const pass = SMTP_PASS || EMAIL_PASS || GMAIL_APP_PASSWORD;
  const fromAddress = SMTP_FROM || EMAIL_FROM || user;

  if (!user || !pass) {
    console.warn(
      'SMTP credentials not fully provided (need SMTP_USER/GMAIL_USER and SMTP_PASS/GMAIL_APP_PASSWORD). Email notifications disabled.'
    );
    return null;
  }

  const resolvedPort = Number(SMTP_PORT || EMAIL_PORT) || (host === 'smtp.gmail.com' ? 465 : 587);
  const resolvedSecure = normalizeBoolean(
    typeof SMTP_SECURE !== 'undefined' ? SMTP_SECURE : EMAIL_SECURE,
    host === 'smtp.gmail.com' || resolvedPort === 465
  );

  const isGmailHost = host.includes('gmail.com');

  const transportOptions = isGmailHost
    ? {
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      }
    : {
        host,
        port: resolvedPort,
        secure: resolvedSecure,
        auth: {
          user,
          pass,
        },
      };

  transporter = nodemailer.createTransport(transportOptions);

  transporter.verify((error) => {
    if (error) {
      console.error('Failed to verify mail transporter:', error);
    } else {
      console.log('Mail transporter ready');
    }
  });

  transporter.defaultFrom = fromAddress;

  return transporter;
};

exports.sendMail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();
  if (!mailer) {
    return false;
  }

  try {
    const toField = Array.isArray(to) ? to.join(',') : to;
    await mailer.sendMail({
      from: mailer.defaultFrom,
      to: toField,
      subject,
      text,
      html,
    });
    console.log(`Email dispatched to ${toField} with subject "${subject}"`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};



/**
 * SMS and WhatsApp Notification Service using Twilio
 * 
 * Environment variables required:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER (for SMS)
 * - TWILIO_WHATSAPP_NUMBER (for WhatsApp, format: whatsapp:+14155238886)
 */

let twilioClient = null;

const getTwilioClient = () => {
  if (twilioClient) {
    return twilioClient;
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn(
      'Twilio credentials not provided (need TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN). SMS/WhatsApp notifications disabled.'
    );
    return null;
  }

  try {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized successfully');
    return twilioClient;
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
    return null;
  }
};

/**
 * Format phone number with country code
 * @param {String} phone - Phone number
 * @param {String} countryCode - Country code (e.g., 'PK', 'US')
 * @param {String} phoneDialCode - Dial code (e.g., '+92', '+1')
 * @returns {String} Formatted phone number
 */
const formatPhoneNumber = (phone, countryCode, phoneDialCode) => {
  if (!phone) return null;

  // Remove any spaces, dashes, or parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If phone already starts with +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If phoneDialCode is provided, use it
  if (phoneDialCode) {
    const dialCode = phoneDialCode.startsWith('+') ? phoneDialCode : `+${phoneDialCode}`;
    // Remove leading 0 if present (common in Pakistan)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return `${dialCode}${cleaned}`;
  }

  // Default to Pakistan (+92) if countryCode is PK or not specified
  if (!countryCode || countryCode === 'PK' || countryCode === 'Pakistan') {
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return `+92${cleaned}`;
  }

  // For other countries, try to add country code
  // This is a basic implementation - you may need to enhance based on your needs
  return cleaned;
};

/**
 * Send SMS notification
 * @param {String} to - Recipient phone number
 * @param {String} message - Message to send
 * @returns {Boolean} Success status
 */
exports.sendSMS = async (to, message) => {
  const client = getTwilioClient();
  if (!client) {
    return false;
  }

  const { TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_PHONE_NUMBER) {
    console.warn('TWILIO_PHONE_NUMBER not configured. SMS sending disabled.');
    return false;
  }

  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log(`SMS sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error.message);
    return false;
  }
};

/**
 * Send WhatsApp notification
 * @param {String} to - Recipient phone number (will be formatted with whatsapp: prefix)
 * @param {String} message - Message to send
 * @returns {Boolean} Success status
 */
exports.sendWhatsApp = async (to, message) => {
  const client = getTwilioClient();
  if (!client) {
    return false;
  }

  const { TWILIO_WHATSAPP_NUMBER } = process.env;
  if (!TWILIO_WHATSAPP_NUMBER) {
    console.warn('TWILIO_WHATSAPP_NUMBER not configured. WhatsApp sending disabled.');
    return false;
  }

  try {
    // Format phone number for WhatsApp (must start with whatsapp:)
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') 
      ? TWILIO_WHATSAPP_NUMBER 
      : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;

    await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo
    });
    console.log(`WhatsApp message sent successfully to ${whatsappTo}`);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp to ${to}:`, error.message);
    return false;
  }
};

/**
 * Send both SMS and WhatsApp notifications
 * @param {String} phone - Recipient phone number
 * @param {String} countryCode - Country code
 * @param {String} phoneDialCode - Dial code
 * @param {String} message - Message to send
 * @returns {Object} Results for SMS and WhatsApp
 */
exports.sendSMSAndWhatsApp = async (phone, countryCode, phoneDialCode, message) => {
  const formattedPhone = formatPhoneNumber(phone, countryCode, phoneDialCode);
  
  if (!formattedPhone) {
    console.warn('Invalid phone number provided');
    return { sms: false, whatsapp: false };
  }

  const [smsResult, whatsappResult] = await Promise.all([
    exports.sendSMS(formattedPhone, message),
    exports.sendWhatsApp(formattedPhone, message)
  ]);

  return {
    sms: smsResult,
    whatsapp: whatsappResult,
    phone: formattedPhone
  };
};

// Export formatPhoneNumber for use in other modules
exports.formatPhoneNumber = formatPhoneNumber;


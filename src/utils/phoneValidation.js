// Phone number validation by country code
// Common phone number length patterns by country dial code

const PHONE_LENGTH_BY_COUNTRY = {
  '+1': { min: 10, max: 10, name: 'US/Canada' }, // US, Canada
  '+44': { min: 10, max: 10, name: 'UK' }, // United Kingdom
  '+91': { min: 10, max: 10, name: 'India' }, // India
  '+92': { min: 9, max: 10, name: 'Pakistan' }, // Pakistan (9-10 digits, some numbers can be 9 digits)
  '+86': { min: 11, max: 11, name: 'China' }, // China
  '+81': { min: 10, max: 10, name: 'Japan' }, // Japan
  '+49': { min: 10, max: 11, name: 'Germany' }, // Germany
  '+33': { min: 9, max: 9, name: 'France' }, // France
  '+39': { min: 9, max: 10, name: 'Italy' }, // Italy
  '+34': { min: 9, max: 9, name: 'Spain' }, // Spain
  '+7': { min: 10, max: 10, name: 'Russia' }, // Russia
  '+61': { min: 9, max: 9, name: 'Australia' }, // Australia
  '+27': { min: 9, max: 9, name: 'South Africa' }, // South Africa
  '+971': { min: 9, max: 9, name: 'UAE' }, // UAE
  '+966': { min: 9, max: 9, name: 'Saudi Arabia' }, // Saudi Arabia
  '+20': { min: 10, max: 10, name: 'Egypt' }, // Egypt
  '+234': { min: 10, max: 10, name: 'Nigeria' }, // Nigeria
  '+880': { min: 10, max: 10, name: 'Bangladesh' }, // Bangladesh
  '+62': { min: 9, max: 11, name: 'Indonesia' }, // Indonesia
  '+60': { min: 9, max: 10, name: 'Malaysia' }, // Malaysia
  '+65': { min: 8, max: 8, name: 'Singapore' }, // Singapore
  '+66': { min: 9, max: 9, name: 'Thailand' }, // Thailand
  '+84': { min: 9, max: 10, name: 'Vietnam' }, // Vietnam
  '+90': { min: 10, max: 10, name: 'Turkey' }, // Turkey
  '+52': { min: 10, max: 10, name: 'Mexico' }, // Mexico
  '+55': { min: 10, max: 11, name: 'Brazil' }, // Brazil
  '+54': { min: 10, max: 10, name: 'Argentina' }, // Argentina
  '+57': { min: 10, max: 10, name: 'Colombia' }, // Colombia
};

// Default validation for countries not in the list
const DEFAULT_VALIDATION = { min: 7, max: 15 };

/**
 * Strips country code from phone number if present
 * @param {string} phoneNumber - The phone number
 * @param {string} dialCode - The country dial code (e.g., '+92', '+1')
 * @returns {string} - Phone number without country code
 */
const stripCountryCode = (phoneNumber, dialCode) => {
  if (!phoneNumber || !dialCode) return phoneNumber;

  // Remove all non-digit characters
  let numericPhone = phoneNumber.replace(/\D/g, '');
  
  // Remove the + from dial code for comparison
  const dialCodeDigits = dialCode.replace(/\D/g, '');
  
  // Check if phone number starts with country code
  if (numericPhone.startsWith(dialCodeDigits)) {
    // Remove country code
    numericPhone = numericPhone.substring(dialCodeDigits.length);
  }
  
  // Also check for common variations
  // For Pakistan: if starts with 92 (without +), remove it
  if (dialCode === '+92') {
    if (numericPhone.startsWith('92') && numericPhone.length > 10) {
      numericPhone = numericPhone.substring(2);
    }
    // Also handle +92 prefix
    if (numericPhone.startsWith('0092') && numericPhone.length > 12) {
      numericPhone = numericPhone.substring(4);
    }
  }
  
  // For US/Canada: if starts with 1 and length > 10, remove it
  if (dialCode === '+1' && numericPhone.startsWith('1') && numericPhone.length > 10) {
    numericPhone = numericPhone.substring(1);
  }
  
  // For India: if starts with 91 and length > 10, remove it
  if (dialCode === '+91' && numericPhone.startsWith('91') && numericPhone.length > 10) {
    numericPhone = numericPhone.substring(2);
  }
  
  // For UK: if starts with 44 and length > 10, remove it
  if (dialCode === '+44' && numericPhone.startsWith('44') && numericPhone.length > 10) {
    numericPhone = numericPhone.substring(2);
  }
  
  return numericPhone;
};

/**
 * Validates phone number based on country dial code
 * @param {string} phoneNumber - The phone number (with or without country code)
 * @param {string} dialCode - The country dial code (e.g., '+92', '+1')
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePhoneNumber = (phoneNumber, dialCode) => {
  if (!phoneNumber || !dialCode) {
    return {
      isValid: false,
      error: 'Phone number and country code are required',
    };
  }

  // Remove all non-digit characters first
  let numericPhone = phoneNumber.replace(/\D/g, '');

  // Check if phone number is empty after cleaning
  if (!numericPhone || numericPhone.length === 0) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
    };
  }

  // Strip country code if it's already included
  numericPhone = stripCountryCode(numericPhone, dialCode);

  // Get validation rules for the country
  const validation = PHONE_LENGTH_BY_COUNTRY[dialCode] || DEFAULT_VALIDATION;

  // Check length
  if (numericPhone.length < validation.min || numericPhone.length > validation.max) {
    return {
      isValid: false,
      error: `Invalid phone number. ${validation.name || 'This country'} requires ${validation.min === validation.max ? validation.min : `${validation.min}-${validation.max}`} digits.`,
    };
  }

  // Check if phone number starts with 0 (should be removed for most countries)
  // But allow it for some countries where it's valid
  if (numericPhone.startsWith('0')) {
    // Remove leading zero and re-check
    const withoutZero = numericPhone.substring(1);
    if (withoutZero.length >= validation.min && withoutZero.length <= validation.max) {
      numericPhone = withoutZero;
    } else if (numericPhone.length > validation.max) {
      // If with zero it's too long, suggest removing it
      return {
        isValid: false,
        error: 'Please enter your number without the leading zero',
      };
    }
    // If removing zero makes it too short but original length is valid, keep it
    // This handles cases where 0 is part of a valid number format
  }

  // Additional validation: Check if all digits are the same (likely invalid)
  if (numericPhone.length > 1 && numericPhone.split('').every((digit) => digit === numericPhone[0])) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
    };
  }

  return {
    isValid: true,
    error: '',
  };
};

/**
 * Formats phone number for display
 * @param {string} phoneNumber - The phone number (with or without country code)
 * @param {string} dialCode - The country dial code
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, dialCode) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  let numericPhone = phoneNumber.replace(/\D/g, '');
  
  // Strip country code if present
  numericPhone = stripCountryCode(numericPhone, dialCode);
  
  // Remove leading zero if present
  if (numericPhone.startsWith('0')) {
    numericPhone = numericPhone.substring(1);
  }
  
  return `${dialCode}${numericPhone}`;
};


const User = require('../models/User');

const DEFAULT_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || 'owaisshafqat597@gmail.com').trim().toLowerCase();
const DEFAULT_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'asdfqwer';

const ensureDefaultAdmin = async () => {
  try {
    if (!DEFAULT_EMAIL || !DEFAULT_PASSWORD) {
      console.warn('Default admin credentials are not configured. Skipping ensureDefaultAdmin.');
      return;
    }

    // Attempt to fetch the admin with password included
    let admin = await User.findOne({ email: DEFAULT_EMAIL }).select('+password');

    if (admin) {
      let shouldSave = false;

      // Only update role if it's not admin (don't force it if already admin)
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        shouldSave = true;
      }

      // Only update email verification if not verified
      if (!admin.isEmailVerified) {
        admin.isEmailVerified = true;
        shouldSave = true;
      }

      // Only reset password if admin was just created (within last minute)
      // This prevents overwriting user-set passwords on production
      const passwordMatches = await admin.comparePassword(DEFAULT_PASSWORD).catch(() => false);
      const isRecentlyCreated = admin.createdAt && (Date.now() - new Date(admin.createdAt).getTime()) < 60000;
      
      if (!passwordMatches && isRecentlyCreated) {
        // Only reset password if admin was just created (likely first time setup)
        admin.password = DEFAULT_PASSWORD;
        shouldSave = true;
      }

      if (shouldSave) {
        await admin.save();
        console.log(`Updated default admin credentials for ${DEFAULT_EMAIL}`);
      } else {
        console.log(`Default admin ${DEFAULT_EMAIL} already exists and is configured`);
      }

      return;
    }

    // Create new admin if doesn't exist (don't set gender field)
    admin = await User.create({
      name: 'Administrator',
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      role: 'admin',
      isEmailVerified: true
      // gender field not set, will be undefined by default
    });

    console.log(`Created default admin account for ${admin.email}`);
  } catch (error) {
    console.error('Error in ensureDefaultAdmin:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    // Don't throw error - allow server to start even if admin creation fails
    console.warn('Continuing server startup despite admin creation error...');
  }
};

module.exports = ensureDefaultAdmin;


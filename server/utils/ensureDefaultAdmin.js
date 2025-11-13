const User = require('../models/User');

const DEFAULT_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || 'testing@gmail.com').trim().toLowerCase();
const DEFAULT_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'asdfqwer';

const ensureDefaultAdmin = async () => {
  if (!DEFAULT_EMAIL || !DEFAULT_PASSWORD) {
    console.warn('Default admin credentials are not configured. Skipping ensureDefaultAdmin.');
    return;
  }

  // Delete every user that does not match the default admin email
  const deleted = await User.deleteMany({ email: { $ne: DEFAULT_EMAIL } });
  if (deleted.deletedCount) {
    console.log(`Removed ${deleted.deletedCount} user(s) while enforcing default admin credentials.`);
  }

  // Attempt to fetch the admin with password included
  let admin = await User.findOne({ email: DEFAULT_EMAIL }).select('+password');

  if (admin) {
    let shouldSave = false;

    if (admin.role !== 'admin') {
      admin.role = 'admin';
      shouldSave = true;
    }

    if (!admin.isEmailVerified) {
      admin.isEmailVerified = true;
      shouldSave = true;
    }

    // Ensure the password matches the configured default
    const passwordMatches = await admin.comparePassword(DEFAULT_PASSWORD).catch(() => false);
    if (!passwordMatches) {
      admin.password = DEFAULT_PASSWORD;
      shouldSave = true;
    }

    if (shouldSave) {
      await admin.save();
      console.log(`Updated default admin credentials for ${DEFAULT_EMAIL}`);
    } else {
      console.log(`Default admin ${DEFAULT_EMAIL} already in desired state`);
    }

    return;
  }

  admin = await User.create({
    name: 'Administrator',
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD,
    role: 'admin',
    isEmailVerified: true
  });

  console.log(`Created default admin account for ${admin.email}`);
};

module.exports = ensureDefaultAdmin;


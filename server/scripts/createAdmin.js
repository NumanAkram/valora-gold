const dotenv = require('dotenv');
const connectDB = require('../config/database');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    const email = process.env.DEFAULT_ADMIN_EMAIL || 'testing@gmail.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'asdfqwer';
    const name = 'Administrator';

    console.log(`\nCreating/Updating admin user:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}\n`);

    // Check if admin already exists
    let admin = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (admin) {
      console.log('Admin user already exists. Updating...');
      
      // Update admin details (don't set gender if not needed)
      admin.name = name;
      admin.email = email.toLowerCase();
      admin.password = password; // Will be hashed by pre-save hook
      admin.role = 'admin';
      admin.isEmailVerified = true;
      
      // Only save if gender is valid, otherwise let it be undefined
      if (admin.gender === null) {
        admin.gender = undefined;
      }
      
      await admin.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin (don't set gender field)
      admin = await User.create({
        name: name,
        email: email.toLowerCase(),
        password: password,
        role: 'admin',
        isEmailVerified: true
        // gender field not set, will be undefined by default
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log('\nAdmin Details:');
    console.log(`  ID: ${admin._id}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Email Verified: ${admin.isEmailVerified}`);
    console.log('\n✅ You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
};

createAdmin();


const dotenv = require('dotenv');
const connectDB = require('../config/database');
const ensureDefaultAdmin = require('../utils/ensureDefaultAdmin');

dotenv.config();

const resetUsers = async () => {
  try {
    await connectDB();
    await ensureDefaultAdmin();
    process.exit(0);
  } catch (error) {
    console.error('Reset Users Error:', error);
    process.exit(1);
  }
};

resetUsers();


require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge';

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hash = await bcrypt.hash('password123', 12);

    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'narenbodi@gmail.com' },
      { $set: { password: hash } }
    );

    if (result.matchedCount > 0) {
      console.log('Password reset successfully!');
      console.log('Email: narenbodi@gmail.com');
      console.log('New Password: password123');
    } else {
      console.log('User not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetPassword();

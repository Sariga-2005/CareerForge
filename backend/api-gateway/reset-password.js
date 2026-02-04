const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/careerforge');
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

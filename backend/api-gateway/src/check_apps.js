const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const JobApplication = mongoose.model('JobApplication', new mongoose.Schema({}, { strict: false }));
    const appCount = await JobApplication.countDocuments();
    console.log(`Total applications in DB: ${appCount}`);

    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const jobCount = await Job.countDocuments();
    console.log(`Total jobs in DB: ${jobCount}`);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const userCount = await User.countDocuments();
    console.log(`Total users in DB: ${userCount}`);

    const apps = await JobApplication.find().limit(5);
    console.log('Recent applications:', JSON.stringify(apps, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkApplications();

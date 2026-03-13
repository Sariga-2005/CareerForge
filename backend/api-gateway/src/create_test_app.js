const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createTestApplication() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
        firstName: String,
        lastName: String,
        email: String,
        role: String
    }, { strict: false }));
    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const JobApplication = mongoose.model('JobApplication', new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        status: String,
        matchScore: Number,
        appliedAt: Date,
        skills: [String],
        phone: String,
        university: String,
        degree: String,
        cgpa: Number
    }, { timestamps: true }));

    const student = await User.findOne({ role: 'student' });
    const job = await Job.findOne({ status: 'active' });

    if (!student || !job) {
      console.error('Could not find a student or an active job to create an application');
      process.exit(1);
    }

    const application = await JobApplication.create({
      userId: student._id,
      jobId: job._id,
      status: 'pending',
      matchScore: 85,
      skills: ['React', 'Node.js', 'TypeScript'],
      phone: student.phone || '9999999999',
      university: 'State University',
      degree: 'B.Tech CSE',
      cgpa: 8.52
    });

    console.log('Successfully created test application:', application._id);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

createTestApplication();

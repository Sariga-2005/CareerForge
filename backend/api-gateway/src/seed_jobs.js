const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('No admin user found to seed jobs');
      process.exit(1);
    }

    const Job = mongoose.model('Job', new mongoose.Schema({
      companyName: String,
      title: String,
      description: String,
      requirements: [String],
      responsibilities: [String],
      type: String,
      level: String,
      department: String,
      requiredSkills: [String],
      salary: { min: Number, max: Number, currency: String, period: String },
      location: String,
      isRemote: Boolean,
      applicationDeadline: Date,
      status: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      stats: { views: Number, applications: Number, shortlisted: Number, selected: Number }
    }, { timestamps: true }));

    await Job.deleteMany({}); // Optional: clear existing jobs

    const sampleJobs = [
      {
        companyName: 'Google',
        title: 'Software Engineer',
        description: 'Join our team to build scalable systems that impact billions of users worldwide.',
        requirements: ['BS in CS', 'Strong algorithms', 'Java/Python'],
        responsibilities: ['Write code', 'Research architectures'],
        type: 'full-time',
        level: 'entry',
        department: 'Engineering',
        requiredSkills: ['C++', 'Python', 'Go', 'Distributed Systems'],
        salary: { min: 1800000, max: 2800000, currency: 'INR', period: 'annual' },
        location: 'Bangalore, India',
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 }
      },
      {
        companyName: 'Microsoft',
        title: 'Full Stack Developer',
        description: 'Build robust web applications using React and Node.js.',
        requirements: ['React experience', 'Node.js mastery'],
        responsibilities: ['Develop frontend', 'API design'],
        type: 'full-time',
        level: 'mid',
        department: 'Product',
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        salary: { min: 1500000, max: 2500000, currency: 'INR', period: 'annual' },
        location: 'Hyderabad, India',
        isRemote: true,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 }
      },
      {
        companyName: 'Amazon',
        title: 'Data Science Intern',
        description: 'Work on cutting-edge machine learning models to improve customer experience.',
        requirements: ['Python/R knowledge', 'Statistics background'],
        responsibilities: ['Data cleaning', 'Model training'],
        type: 'internship',
        level: 'entry',
        department: 'Data Science',
        requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
        salary: { min: 50000, max: 80000, currency: 'INR', period: 'monthly' },
        location: 'Chennai, India',
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 }
      },
      {
        companyName: 'Flipkart',
        title: 'Frontend Developer',
        description: 'Create beautiful and performant user interfaces for India\'s largest e-commerce platform.',
        requirements: ['React expertise', 'CSS/SCSS skills'],
        responsibilities: ['Component development', 'Performance optimization'],
        type: 'full-time',
        level: 'entry',
        department: 'Product',
        requiredSkills: ['React', 'JavaScript', 'CSS', 'Redux'],
        salary: { min: 1200000, max: 1800000, currency: 'INR', period: 'annual' },
        location: 'Bangalore, India',
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 }
      },
      {
        companyName: 'Razorpay',
        title: 'Backend Engineer',
        description: 'Build robust payment infrastructure handling millions of transactions daily.',
        requirements: ['Go/Java experience', 'Database knowledge'],
        responsibilities: ['API development', 'System design'],
        type: 'full-time',
        level: 'mid',
        department: 'Engineering',
        requiredSkills: ['Go', 'PostgreSQL', 'Redis', 'Microservices'],
        salary: { min: 1400000, max: 2000000, currency: 'INR', period: 'annual' },
        location: 'Bangalore, India',
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 }
      },
      {
        companyName: 'Swiggy',
        title: 'DevOps Engineer',
        description: 'Manage and optimize cloud infrastructure for food delivery platform.',
        requirements: ['AWS mastery', 'Kubernetes experience'],
        responsibilities: ['Infrastructure as Code', 'CI/CD pipelines'],
        type: 'full-time',
        level: 'mid',
        department: 'Cloud',
        requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
        salary: { min: 1600000, max: 2400000, currency: 'INR', period: 'annual' },
        location: 'Bangalore, India',
        isRemote: true,
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active',
        createdBy: admin._id,
        stats: { views: 0, applications: 0, shortlisted: 0, selected: 0 }
      }
    ];

    await Job.insertMany(sampleJobs);
    console.log('Successfully seeded all jobs');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

seedJobs();

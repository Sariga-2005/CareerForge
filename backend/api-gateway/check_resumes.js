const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge');
  const db = mongoose.connection.db;
  const resumes = await db.collection('resumes').find({}).toArray();
  console.log("Total resumes:", resumes.length);
  resumes.forEach(r => {
    console.log("Resume ID:", r._id, "User ID:", r.userId);
    console.log("Skills:", JSON.stringify(r.skills || {}));
    console.log("ParsedData extracted_data technical_skills:", JSON.stringify(r.parsedData?.extracted_data?.technical_skills || []));
  });
  process.exit(0);
}

run().catch(console.error);

const mongoose = require('mongoose');

// MongoDB connection string from .env
const MONGODB_URI = 'mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge';

async function promoteToAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Find user by name (case-insensitive)
        const user = await usersCollection.findOne({
            firstName: { $regex: /^naren$/i },
            lastName: { $regex: /^moorthy$/i },
        });

        if (!user) {
            console.log('User "Naren Moorthy" not found. Listing all users:');
            const allUsers = await usersCollection.find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }).toArray();
            allUsers.forEach(u => console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) [${u.role}]`));
            process.exit(1);
        }

        console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`Current role: ${user.role}`);

        if (user.role === 'admin') {
            console.log('User is already an admin!');
            process.exit(0);
        }

        // Update role to admin
        const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: { role: 'admin' } }
        );

        if (result.modifiedCount === 1) {
            console.log('✅ Successfully promoted to admin!');
            console.log('Please log out and log back in for changes to take effect.');
        } else {
            console.log('❌ Failed to update role.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

promoteToAdmin();

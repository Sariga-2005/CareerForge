require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/careerforge';
const ATLAS_URI = 'mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge';

async function migrateData() {
    console.log('🚀 Starting migration from local MongoDB to Atlas...\n');

    let localConn, atlasConn;

    try {
        localConn = await mongoose.createConnection(LOCAL_URI, {
            serverSelectionTimeoutMS: 5000
        }).asPromise();
        console.log('✅ Connected to local MongoDB');
    } catch (err) {
        console.error('❌ Cannot connect to local MongoDB. Is it running?');
        process.exit(1);
    }

    try {
        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log('✅ Connected to MongoDB Atlas\n');
    } catch (err) {
        console.error('❌ Cannot connect to MongoDB Atlas:', err.message);
        await localConn.close();
        process.exit(1);
    }

    const collections = await localConn.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections to migrate\n`);

    for (const collInfo of collections) {
        const collName = collInfo.name;
        try {
            const docs = await localConn.db.collection(collName).find({}).toArray();
            if (docs.length > 0) {
                await atlasConn.db.collection(collName).deleteMany({});
                await atlasConn.db.collection(collName).insertMany(docs);
                console.log(`✅ ${collName}: Migrated ${docs.length} documents`);
            } else {
                console.log(`⏭️  ${collName}: Empty`);
            }
        } catch (error) {
            console.error(`❌ ${collName}: ${error.message}`);
        }
    }

    console.log('\n🎉 Migration complete!');
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
}

migrateData().catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
});

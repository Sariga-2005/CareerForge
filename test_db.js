const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://db_user:password%40123@careerforge.tkz6cww.mongodb.net/careerforge";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('careerforge');
        const resumes = database.collection('resumes');

        // Query for a resume that matches the one in the screenshot or just the latest
        const query = {};
        const options = {
            sort: { createdAt: -1 },
        };

        const resume = await resumes.findOne(query, options);
        console.log(JSON.stringify(resume, null, 2));

    } finally {
        await client.close();
    }
}

main().catch(console.dir);

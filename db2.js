const {
    MongoClient
} = require("mongodb");

// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://admin:admin@teamWork.7li5g.mongodb.net/dataBASED?retryWrites=true&w=majority";
const client = new MongoClient(url);

// The database to use
const dbName = "dataBASED";

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        // Use the collection "challenges"
        const col = db.collection("challenges");

        // Construct a document                                                                                                                                                              
        let challenge = {
            "name": "testChallenge",
            "points": 1,
            "course": "DEV"
        }

        // Insert a single document, wait for promise so we can read it back
        const p = await col.insertOne(challenge);
        // Find one document
        const myDoc = await col.findOne();
        // Print to the console
        console.log(myDoc);
        console.log('test');

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
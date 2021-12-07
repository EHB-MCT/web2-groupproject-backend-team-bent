const {
    MongoClient
} = require('mongodb');
const uri = "mongodb+srv://admin:admin@teamwork.7li5g.mongodb.net/dataBASED?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.connect(err => {
    const collection = client.db("dataBASED").collection("challenges");
    // perform actions on the collection object
    client.close();
});



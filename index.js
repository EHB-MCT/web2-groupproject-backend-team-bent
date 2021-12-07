const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");

// Had to make a path import because for some reason vsc didn't recognize my .env file
const path = require("path");
require("dotenv").config({ path: path.resolve(".env") });

console.log(process.env.TEST);

const client = new MongoClient(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT;

app.use(express.static("public"));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Root route
app.get("/", (req, res) => {
    res.status(300).redirect("/info.html");
});

// Return all challenges
app.get("/challenges", async (req, res) => {
    try {
        // Connect to the database
        await client.connect();

        // Retrieve the challenges collection data
        const col = client.db("dataBASED").collection("challenges");
        const chals = await col.find({}).toArray();

        // Send back the file
        res.status(200).send(chals);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "something went wrong",
            value: error,
        });
    } finally {
        await client.close();
    }
});

// Return a single challenge
app.get("/challenge/:id", async (req, res) => {
    // id is located in the query: req.query.id
    try {
        // Connect to the database
        await client.connect();

        // Retrieve the challenges collection data
        const col = client.db("dataBASED").collection("challenges");

        // Force the req.query.id into an ObjectId otherwise you won't be able to log anything.
        // Important: Make sure to import ObjectId as `const ObjectId = require("mongodb").ObjectId`
        const query = { _id: ObjectId(req.params.id) };
        const chal = await col.findOne(query);

        if (chal) {
            // Send back the file
            res.status(200).send(chal);
            return;
        } else {
            res.status(400).send(`Challenge with id \"${req.params.id}\" could not be found`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "Data could not be read... try again later!",
            value: error,
        });
    } finally {
        await client.close();
    }
});

// Save a challenge
app.post("/challenge", async (req, res) => {
    // Validation
    if (!req.body.name || !req.body.points || !req.body.session || !req.body.course) {
        res.status(400).send("Bad request: Missing name, points, session or course");
        return;
    }
    try {
        // Connect to the database
        await client.connect();

        // Retrieve the challenges collection data
        const col = client.db("dataBASED").collection("challenges");

        // Validation for double challenges
        // const chal = await col.findOne({ name: req.body.name, points: req.body.points, session: req.body.session, course: req.body.course });
        // if (chal) {
        //     res.status(400).send(`Challenge with name \"${req.body.name}\" already exists`);
        //     return;
        // }

        // Create the new challenge object
        let newChal = {
            name: req.body.name,
            points: req.body.points,
            session: req.body.session,
            course: req.body.course,
        };

        // Insert into the database
        let insertResult = await col.insertOne(newChal);

        // Send back success message
        res.status(201).send(`Challenge with name \"${req.body.name}\" successfully saved.`);
        return;
    } catch (error) {
        res.status(500).send({
            error: "Something went wrong...",
            value: error,
        });
    }
});

// Update a challenge
app.put("/challenges/:id", async (req, res) => {
    try {
        // Connect to the database
        await client.connect();

        // Retrieve the challenges collection data
        const col = client.db("dataBASED").collection("challenges");

        // Create a query for a challenge to update
        const query = { _id: ObjectId(req.params.id) };

        // This option instructs the method to create a document if no documents match the filter
        const options = { upsert: true };

        // Create a document that sets the plot of the movie
        const updateChal = {
            $set: {
                name: req.body.name,
                points: req.body.points,
                session: req.body.session,
                course: req.body.course,
            },
        };

        // Updating the challenge
        const result = await col.updateOne(params, updateChal, options);

        // Send back success message
        res.status(201).send(`Challenge with id "${req.params.id}" successfully updated.`);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "something went wrong",
            value: error,
        });
    } finally {
        await client.close();
    }
});

// Deleting a challenge
app.delete("/challenges/:id", async (req, res) => {
    try {
        // Connect to the database
        await client.connect();

        // Retrieve the challenges collection data
        const col = client.db("dataBASED").collection("challenges");

        // Create a query for a challenge to delete
        const query = { _id: ObjectId(req.params.id) };

        // Deleting the challenge
        const result = await col.deleteOne(query);
        if (result.deletedCount === 1) {
            res.status(200).send(`Challenge with id "${req.params.id}" successfully deleted.`);
        } else {
            res.status(404).send("No documents matched the query. Deleted 0 documents.");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "something went wrong",
            value: error,
        });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
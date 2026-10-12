const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const client = new MongoClient(
    "mongodb://127.0.0.1:27017"
);

async function startServer() {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("college");
    const students = db.collection("students");

    app.get("/students", async (req, res) => {
        const data = await students.find().toArray();
        res.json(data);
    });

    app.post("/students", async (req, res) => {
        await students.insertOne(req.body);
        res.send("Student added successfully");
    });

    app.put("/students/:id", async (req, res) => {
        const result = await students.updateOne(
            { id: req.params.id },
            { $set: req.body }
        );

        res.send(
            result.matchedCount
                ? "Student updated successfully"
                : "Student not found"
        );
    });

    app.delete("/students/:id", async (req, res) => {
        const result = await students.deleteOne({
            id: req.params.id
        });

        res.send(
            result.deletedCount
                ? "Student deleted successfully"
                : "Student not found"
        );
    });

    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
}

startServer().catch(console.error);

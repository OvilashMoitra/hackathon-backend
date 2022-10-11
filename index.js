const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
var Moment = require('moment');
const today = new Date();
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtj8fxm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const hackathonCollection = client.db("hackathon").collection("hackathon");
        // create a document to insert
        app.post('/hackathon', async (req, res) => {
            const newHackathon = req.body;
            const result = await hackathonCollection.insertOne(newHackathon);
            res.send(result);
        })
        // Get all hackathon data
        app.get('/getHackathonData', async (req, res) => {
            const query = {}
            const cursor = hackathonCollection.find(query);
            const hackathons = await cursor.toArray();
            for (let i = 0; i < hackathons.length; i++) {
                if (Moment(hackathons[i]?.endDate).unix() < Moment(today).unix()) {
                    hackathons[i] = { ...hackathons[i], "status": "Past" };
                } else if (Moment(today).unix() < Moment(hackathons[i].startDate).unix()) {
                    hackathons[i] = { ...hackathons[i], "status": "Upcoming" };
                } else if (Moment(today).unix() >= Moment(hackathons[i]?.startDate).unix() && Moment(today).unix() <= Moment(hackathons[i]?.endDate).unix()) {
                    hackathons[i] = { ...hackathons[i], "status": "Active" };
                }
                // hackathons[i] = { ...hackathons[i], "status": "Past" };
            }
            // const newArray = hackathons.(hackathon => {
            //     if (Moment(hackathon?.endDate).unix() < Moment(today).unix()) {
            //         hackathon = { ...hackathon, "status": "Past" }
            //     } else if (Moment(today).unix() < Moment(hackathon?.startDate).unix()) {
            //         hackathon = { ...hackathon, "status": "Upcoming" }
            //     } else if (Moment(today).unix() >= Moment(hackathon?.startDate).unix() && Moment(today).unix() <= Moment(hackathon?.endDate).unix()) {
            //         hackathon = { ...hackathon, "status": "Active" }
            //     }
            // });
            console.log(hackathons);
            res.send(hackathons);
        })
        // Get specific hackathon data
        app.get('/getHackathonData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const Hackathon = await hackathonCollection.findOne(query);
            res.send(Hackathon);
        })
        // Delete a specific Hackathon
        app.delete('/deleteHackathon/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await hackathonCollection.deleteOne(query);
            res.send(result);
        })
        // Edit a specific Hackathon info
        app.put('/editHackathon/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const newValues = { $set: req.body };
            const result = await hackathonCollection.updateOne(query, newValues);
            res.send(result);
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Running my node CRUD server')
})

app.listen(port, () => {
    console.log('crud server is running ');
})
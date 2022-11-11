const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middlewere
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.es5pnpl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//tarvelTour.packages
async function run() {
    try {
        const packageCollections = client.db('tarvelTour').collection('packages');
        const reviewCollections = client.db('tarvelTour').collection('userReview');

        app.get('/packages', async (req, res) => {
            const query = {}
            const cursor = packageCollections.find(query);
            const packages = await cursor.limit(3).toArray();
            res.send(packages);
        })

        app.get('/allpackages', async (req, res) => {
            const query = {}
            const cursor = packageCollections.find(query);
            const packages = await cursor.toArray();
            res.send(packages);
        })

        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packageCollections.findOne(query);
            res.send(package)

        });
        // get all reviews
        app.get('/reviews', async (req, res) => {
            console.log(req.query)
            let query = {};
            if (req.query.package) {
                query = {
                    package: req.query.packageId
                }
            }
            const cursor = reviewCollections.find(query).sort({ _id: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews)
        })


        // review api
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewCollections.insertOne(reviews);
            res.send(result);
        })


    }
    finally {

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('Travel server is running')
});


app.listen(port, () => {
    console.log(`Travel server is running on: ${port}`)
})


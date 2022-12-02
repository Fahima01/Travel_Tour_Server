const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded
        next();
    })
}



//tarvelTour.packages
async function run() {
    try {
        const packageCollections = client.db('tarvelTour').collection('packages');
        const reviewCollections = client.db('tarvelTour').collection('userReview');
        const addpackageCollections = client.db('tarvelTour').collection('userPackage');

        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })

        })


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

        //get all reviews
        app.get('/reviews', verifyJwt, async (req, res) => {
            const decoded = req.decoded.email;
            console.log(decoded)
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

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

        //set userPackage
        app.post('/userPackage', async (req, res) => {
            const addPackages = req.body;
            const result = await addpackageCollections.insertOne(addPackages);
            res.send(result);
        });
        app.get('/userPackage', async (req, res) => {
            const query = {}
            const cursor = addpackageCollections.find(query);
            const packages = await cursor.toArray();
            res.send(packages);
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


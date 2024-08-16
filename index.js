const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x7pm4nr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const DB = client.db("ShopiFy")
    const productCollection = DB.collection('products')

    app.get('/products', async (req, res) => {
      const result = await productCollection.find().toArray()
      return res.send(result)
    })

    app.post('/products', async (req, res) => {
      const { keyword, category, brand, minPrice, maxPrice, sortByDate, sortByPrice } = req.body;

      let query = {};

      // Searching the keyword in the name and description fields
      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ];
      }



      // Define the sort object
      let sort = {};

      // Sort by date if requested
      if (sortByDate) {
        sort.date = -1; // Sort by date descending (newest first)
      }

      // Sort by price if requested
      if (sortByPrice) {
        sort.price = 1; // Sort by price ascending (cheapest first)
      }

      try {
        // Fetch the products from the database using the query and sort
        const result = await productCollection.find(query).sort(sort).toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).send("Internal Server Error");
      }
    });








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("App is running")
})

app.listen(port, () => {
  console.log(`running on http://localhost:${port}`)
})
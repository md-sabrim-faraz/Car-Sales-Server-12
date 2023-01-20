const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2r10p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("buy_car");
    const carCollection = database.collection("cars");
    const purchaseCollection = database.collection("purchases");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");

    // GET CARS API

    app.get("/cars", async (req, res) => {
      const cursor = carCollection.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    });

    // GET SINGLE CAR

    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const car = await carCollection.findOne(query);
      res.send(car);
    });

    // Add a car

    app.post("/cars", async (req, res) => {
      const car = req.body;
      const result = await carCollection.insertOne(car);
      res.send(result);
    });

    // delete a car

    app.delete("/cars/:id", async (req, res) => {
      const result = await carCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    // POST Purchases

    app.post("/purchases", async (req, res) => {
      const purchase = req.body;
      const result = await purchaseCollection.insertOne(purchase);
      res.send(result);
    });

    // GET All Orders

    app.get("/purchases", async (req, res) => {
      const cursor = await purchaseCollection.find({});
      const purchases = await cursor.toArray();
      res.send(purchases);
    });

    // GET My Orders...

    app.get("/purchases/:email", async (req, res) => {
      const result = await purchaseCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // GET specific purchase for payment

    app.get("/purchases/pay/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.findOne(query);
      res.send(result);
    });

    // delete an order

    app.delete("/purchases/:id", async (req, res) => {
      const result = await purchaseCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    // update status

    app.put("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrderStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updateOrderStatus.status,
        },
      };
      const result = await purchaseCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Add a user

    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(user);
    });

    // make an admin

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // get an admin

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    // add reviews

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // get all reviews

    app.get("/reviews", async (req, res) => {
      const cursor = await reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BuyCar Running the Server");
});

app.listen(port, () => {
  console.log("BuyCar Server port", port);
});

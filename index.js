const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 8000;
dotenv.config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());
async function run() {
  try {
    await client.connect();
    const db = client.db("study");
    const roomsCollection = db.collection("rooms");
    const bookingCollection = db.collection("bookings");

    app.post("/rooms", async (req, res) => {
      const data = req.body;
       data.hourlyRate = Number(data.hourlyRate)
      const result = await roomsCollection.insertOne(data);
    });
    app.patch("/rooms/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const result = await roomsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData },
      );
      res.send(result);
    });

    app.delete("/rooms/:id", async (req, res) => {
      const { id } = req.params;
      const result = await roomsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/rooms", async (req, res) => {
      const { search, amenities, minRate, maxRate } = req.query;
      let query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      if (amenities) {
        const amenityArray = amenities.split(",");
        query.amenities = { $in: amenityArray };
      }

      if (minRate || maxRate) {
        query.hourlyRate = {};
        if (minRate) query.hourlyRate.$gte = Number(minRate);
        if (maxRate) query.hourlyRate.$lte = Number(maxRate);
      }

      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/rooms/:id", async (req, res) => {
      const { id } = req.params;
      const result = await roomsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/my-rooms", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await roomsCollection.insertOne(data);
    });

    app.get("/my-rooms/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await roomsCollection.find({ userId }).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      try {
        const bookingData = req.body;

        const alreadyBooked = await bookingCollection.findOne({
          roomId: bookingData?.roomId,
          date: bookingData?.date,
          timeSlot: bookingData?.timeSlot,
        });
        if (alreadyBooked) {
          return res.status(400).send({
            success: false,
            message:
              "This slot is already booked. Please choose a different time or date",
          });
        }

        const result = await bookingCollection.insertOne(bookingData);
        res.send({
          success: true,
          result,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    app.get("/bookings/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.send(result);
    });
    app.patch("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const result = await bookingCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status } },
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is run");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

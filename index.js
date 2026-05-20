const express = require('express');
const { MongoClient,ServerApiVersion } = require('mongodb');
const app = express();
const port =process.env.PORT|| 8000;




const uri = "mongodb://studynook:QmHyFfMXbHB9eW52@ac-tg1a4el-shard-00-00.twjplkw.mongodb.net:27017,ac-tg1a4el-shard-00-01.twjplkw.mongodb.net:27017,ac-tg1a4el-shard-00-02.twjplkw.mongodb.net:27017/?ssl=true&replicaSet=atlas-4nelvq-shard-0&authSource=admin&appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})


async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('server is run');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
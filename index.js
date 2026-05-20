const express = require('express');
const dotenv=require('dotenv')
const cors=require('cors')
const { MongoClient,ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port =process.env.PORT|| 8000;
dotenv.config()

const uri = process.env.MONGO_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

app.use(cors())
app.use(express.json())
async function run() {
  try {
    await client.connect();
    const db= client.db('study')
    const roomsCollection=db.collection('rooms')


    app.post('/rooms', async(req,res)=>{
      const data=req.body
      console.log(data)
      const result= await roomsCollection.insertOne(data)
    })
    app.get('/rooms',async(req,res)=>{   
      const result=await roomsCollection.find().toArray()
      res.send(result)
    })
    app.get('/rooms/:id',async(req,res)=>{ 
      const {id}=req.params  
      const result=await roomsCollection.findOne({_id: new ObjectId(id)})
      res.send(result)
    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('server is run');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000

const ObjectId = require('mongodb').ObjectId
app.use(cors())
app.use(express.json())

require ('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlklf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async() =>{
      try{
             client.connect();
            console.log("database connected")

            const database = client.db("hospital-web")
            const doctorsCollection = database.collection("doctors")
            const departmentsCollection = database.collection("departments")
            const appointmentsCollection = database.collection("appointments")
            const usersCollection = database.collection('users')
            // const reviewsCollection = database.collection('reviews')


            // post appointments information
            app.post('/appointments',async(req,res) => {
                  console.log(req.body)
                  const doc = await appointmentsCollection.insertOne(req.body)
                  res.json(doc)
            })

             // get all the appointments
             app.get('/appointments', async(req,res)=>{
                  const cursor = await appointmentsCollection.find({})
                  const result = await cursor.toArray()
                  res.json(result)
            })

            // get all the doctors
            app.get('/doctors', async(req,res)=>{
                  const cursor = await doctorsCollection.find({})
                  const result = await cursor.toArray()
                  res.json(result)
            })
            // get all the departments
            app.get('/departments', async(req,res)=>{
                  const cursor = await departmentsCollection.find({})
                  const result = await cursor.toArray()
                  res.json(result)
            })

            // update status  by the admin
            app.put('/appointments/:id', async(req,res)=>{
                  const id = req.params.id
                  console.log(id)
                  const updatedUser = req.body
                  console.log(updatedUser)
                  const filter = {_id:ObjectId(id)}
                  const option = {upsert : true}
                  const updateDoc = {
                        $set: {
                              status: `Approved`
                        },
                        };
                  const result = await appointmentsCollection.updateOne(filter,updateDoc,option)

                  res.json(result)
            })

            // save users information
            app.post('/signed/users', async(req,res) =>{
                  const user = req.body
                  const result = await usersCollection.insertOne(user)
                  res.json(result)
            })

            

            //user update as Admin
            app.put('/users/admin/:id', async(req,res)=>{
                  const user = req.params.id
                  const updatedUser = req.body
                  console.log(user,updatedUser)
                  const filter = {email:user}
                  const option = {upsert : true}
                  console.log(filter)
                  const updateDoc = {
                        $set: {
                          role: `admin`
                        },
                      };
                        console.log(updateDoc)
                  const result = await usersCollection.updateOne(filter,updateDoc,option)
                  console.log(result)

                  res.json(result)
            })

            // check user is admin or not
            app.get('/users/admin/:email', async (req, res) => {
                  const email = req.params?.email;
                  console.log(email)
                  const query = { email: email };
                  const user = await usersCollection.findOne(query);
                  let isAdmin = false;
                  if (user?.role === 'admin') {
                        isAdmin = true;
                  }
                  res.json({ admin: isAdmin });
            })

            

            // delete appointment by the admin
            app.delete('/appointments/:id', async(req,res)=>{
                  console.log(req.params.id)
                  const query = {_id:ObjectId(req.params.id)}
                  const result = await appointmentsCollection.deleteOne(query)
                  res.json(result)
            })

           

            app.get('/', async(req,res) =>{
                  console.log("server running")
                  res.send('Server Running')
            })
            app.listen(port,() =>{
                  console.log("listening from port",port)
            })

      }
      finally{
                  // await client.close();
      }

}
run().catch(console.dir);
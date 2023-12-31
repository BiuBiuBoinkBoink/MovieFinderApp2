const express = require('express')
const app = express() 
const cors = require('cors') 
const {MongoClient, ObjectId } = require('mongodb')
const { response } = require('express')
const { request } = require('http')
require('dotenv').config() 
const PORT = 8000


let db,
    dbConnectionStr = process.env.DB_STRING, 
    dbName = 'sample_mflix',
    collection 



MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('Connected to database')
        db = client.db(dbName)
        colletion = db.collection('movies')

    })

app.use(express.urlencoded({extende : true}))
app.use(express.json())
app.use(cors())

// first get is to just to get back an array of possiblities 
app.get("/search", async (request, response) => {
    try { 
        let result = await collection.aggregate([
            {
                "$Search" : { 
                    "autocomplete" : { 
                        "query" : `${request.query.query}`,
                        "path" : "title",
                        "fuzzy": { 
                            "maxEdits" : 2, 
                            "prefixlength": 3, 
                        }
                    }
                }
            }
        ]).toArray()
        response.send(result)
    } catch(error) {
        response.status(500).send({message: error.message})

    }
})

// Second get is to get info associated with the specific movie
app.get("/get/:id", async(request, responese) => {
    try { 
        let result = await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    } catch (error) { 
        response.status(500).send({message : error.message})
    }
})


app.listen(process.env.PORT || PORT,() => { 
    console.log('Server is running.')
})
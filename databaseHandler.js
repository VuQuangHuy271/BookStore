const {MongoClient,ObjectId} = require('mongodb');

const DATABASE_URL = 'mongodb://Splace:Vuhuybn1@ass2-shard-00-00.6j7uj.mongodb.net:27017,ass2-shard-00-01.6j7uj.mongodb.net:27017,ass2-shard-00-02.6j7uj.mongodb.net:27017/test?replicaSet=atlas-3fflu9-shard-0&ssl=true&authSource=admin'
const DATABASE_NAME = 'Ass2'

async function getDatabase() {
    const client = await MongoClient.connect(DATABASE_URL)
    const dbo = client.db(DATABASE_NAME)
    return dbo
}

async function insertObject(collectionName,objectToInsert){
    const dbo = await getDatabase();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
    console.log("Gia tri id moi duoc insert la: ", newObject.insertedId.toHexString());
}

async function getIndexDocuments(collectionName) {
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({name:1}).limit(6).toArray()   
    // const results = await dbo.collection(collectionName).find({}).toArray()
    return results
}

async function getAllDocuments(collectionName) {
    const dbo = await getDatabase()
    // const results = await dbo.collection("Products").find({}).sort({name:1}).limit(5).toArray()   
    const results = await dbo.collection(collectionName).find({}).toArray()
    return results
}


async function FindDocumentsByname(value) {
    const dbo = await getDatabase()
    //const results = await dbo.collection("Products").find({}).sort({name:1}).limit(7).toArray()   
    const results = await dbo.collection("Products").findOne({name: value})
    return results
}

async function FindDocumentsByEmail(value) {
    const dbo = await getDatabase()
    const results = await dbo.collection("Users").findOne({email: value})
    return results
}

async function FindDocumentsByPhone(value) {
    const dbo = await getDatabase()
    const results = await dbo.collection("Users").findOne({phone: value})
    return results
}

async function checkUserRole(emailI,passI){
    const dbo = await getDatabase()
    const user= await dbo.collection("Users").find({email: emailI, password: passI});
    if (user == null) {
        return "-1"
    }else if(user.role == "Customer"){
        return "Customer";
    }else{
        return user.role;
    }
}
module.exports = {insertObject, getAllDocuments, FindDocumentsByname, checkUserRole, FindDocumentsByEmail, getIndexDocuments, FindDocumentsByPhone}


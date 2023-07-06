import {MongoClient} from "mongodb";

const dbName = 'squealer';
const dbUser = 'site222315';
const dbPassword = 'ay5ieNai';
const dbHost = 'mongo_site222315';

let client : MongoClient;

async function db_open() {
    const url = `mongodb://${dbUser}:${dbPassword}@${dbHost}?writeConcern=majority`;
    client = new MongoClient(url);


          // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to database');
    //console.log('Found documents =>', result);


}

async function db_close() {
    await client.close();
}

async function db_op(collectionName : string , op : Function) {
    if(!client)
        await db_open();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    return await op(collection);

}
const db_access = db_op;
export { db_open, db_close, db_op, db_access }

import mongoose from "mongoose";

const dbName = 'squealer';
const dbUser = 'site222315';
const dbPassword = 'ay5ieNai';
const dbHost = 'mongo_site222315';


async function db_open() {
    const url = `mongodb://${dbUser}:${dbPassword}@${dbHost}/${dbName}`;

    mongoose.connect(url)
    .then(
        () =>  console.log('Connesso, yeee'),
        (err) => console.error('Error:' + err)
    )

}

async function db_close() {
}

/*
async function db_op(collectionName : string , op : Function) {
    if(!client)
        await db_open();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    return await op(collection);

}
const db_access = db_op;*/
export { db_open, db_close }

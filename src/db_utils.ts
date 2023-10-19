import mongoose from "mongoose";
import {UserModel} from "./models/userModel";
const dbName = process.env.DBNAME
const dbUser = process.env.DBUSER
const dbPassword = process.env.DBPASSWORD
const dbHost = process.env.DBHOST


async function db_open() {
    const url = `mongodb://${dbUser}:${dbPassword}@${dbHost}/${dbName}`;

    mongoose.connect(url, {
                    authSource: 'admin'
    })
    //.then(() => updateUsersWithDefault())
    .then(
        () => {
          console.log('Connesso, yeee')
          bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'media',
          });
        },
        (err) => console.error('Error:' + err)
    )

}

async function db_close() {
}
/*
// Lascio qui. nel caso volessimo aggiornare il DB senza resettarlo
async function updateUsersWithDefault() {
  try {
    const result = UserModel.updateMany({}, {
        $rename: {
          subscribed: 'subscriptions'
        },
    })
    //const result = await UserModel.find({ profilePicUrl: { $exists: false } }) // Filter for users without profilePicUrl

    return result

  } catch (error) {
    console.error('Error:', error);
  }
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

// non so se è corretto dichiarare bucket qui
// però è usato in entrambi i metodi in mediaControllers e ridichiararlo mi sembra brutto
let bucket : mongoose.mongo.GridFSBucket;
export { db_open, db_close, bucket }


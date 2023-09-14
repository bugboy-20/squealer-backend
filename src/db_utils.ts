import mongoose from "mongoose";
import {UserModel, User} from './models/userModel'; // Import your UserModel

const dbName = process.env.DBNAME
const dbUser = process.env.DBUSER
const dbPassword = process.env.DBPASSWORD
const dbHost = process.env.DBHOST


async function db_open() {
    const url = `mongodb://${dbUser}:${dbPassword}@${dbHost}/${dbName}`;

    mongoose.connect(url, {
                    authSource: 'admin'
    })
    //.then(() => updateUsersWithDefaultProfilePicUrl())
    .then(
        () =>  console.log('Connesso, yeee'),
        (err) => console.error('Error:' + err)
    )

}

async function db_close() {
}

/* Lascio qui. nel caso volessimo aggiornare il DB senza resettarlo
async function updateUsersWithDefaultProfilePicUrl() {
  try {
    const result = await UserModel.find({ profilePicUrl: { $exists: false } }) // Filter for users without profilePicUrl

    result.map(async u => 
      UserModel.updateOne({_id: u._id}, { $set: { propic: `https://api.dicebear.com/7.x/lorelei/png?seed=${u.username}`}}))

    return Promise.all(result)

  } catch (error) {
    console.error('Error:', error);
  }
}
*/

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


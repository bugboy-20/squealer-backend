import mongoose from "mongoose";
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
        () =>  console.log('Connesso, yeee'),
        (err) => console.error('Error:' + err)
    )

}

async function db_close() {
}
/*
// Lascio qui. nel caso volessimo aggiornare il DB senza resettarlo
async function updateUsersWithDefault() {
  try {
    const result = SquealModel.updateMany({}, {
        $set: {
            impressions: [],
            positive_reaction: [],
            negative_reaction: []
        }
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
export { db_open, db_close }


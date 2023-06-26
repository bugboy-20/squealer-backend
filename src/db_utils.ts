/*
async function db_access(dbName, collectionName, op) {
    const url = 'mongodb://diego.ammirabile:eache2Ei@mongo_diego.ammirabil?writeConcern=majority';
    const client = new MongoClient(url);

          // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to database');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
[2;2R^[[3;1R

    const result = await op(collection);
    //console.log('Found documents =>', result);
    client.close();



    return result;

}
*/

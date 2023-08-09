import {RequestHandler} from "express";
import {Squeal, SquealModel} from "../models/squealModel";

const getSqueals : RequestHandler = async (req, res) => { // TODO generalizzare il codice query, channels non esiste
  try {
    const queryFilters: { [key: string]: any } = {};

    let squeals : Squeal[];

    console.log(req.query)

    if ( req.params.id )
      queryFilters.id = parseInt( req.params.id );
    if ( req.query.author)
      queryFilters.author =  req.query.author;
    if ( req.query.channel)
      queryFilters.channel =  req.query.channel;
    //TODO cathegory

    squeals = await SquealModel.find(queryFilters).exec();

    if ( req.query.page  && typeof req.query.page === "string") {
      let pNum = parseInt(req.query.page);
      squeals.slice(pNum*10,pNum*10+10)
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(squeals);
    res.end(json);

  } catch (error) {
    // Handle any potential errors during the query
    console.error('listAllUsers error: ' + error)
    //await fetch(...) TODO
    throw error;
  }
}

const updateSqueal : RequestHandler = async (req, res) => { //TODO


  let squealID : number = +req.params.id;
  let opType = req.body.op;
  let dbRes;
  
  try {
    switch (opType) {
      case "viewed":
        dbRes = await SquealModel.updateOne({"id": squealID}, { $inc: {"impressions":1}}); break;
      case "upvote":
        dbRes = await SquealModel.updateOne({"id": squealID}, { $inc: {"positive_reaction":1}}); break;
      case "downvote":
        dbRes = await SquealModel.updateOne({"id": squealID}, { $inc: {"negative_reaction":-1}}); break; //TODO controllare funzioni
    }
    res.end(JSON.stringify(dbRes))
  } catch(e) {
    res.statusCode = 400;
    res.end('errore non aggiornato')
  }

}

const postSqueal : RequestHandler = async (req, res) => {

  try {
    const squeal = new SquealModel(req.body);
    /*const existingUser = await UserModel.findOne({ username: user.username }).exec();

    if (existingUser) {
      res.statusCode = 409
      return res.json({ message: 'Username already taken' });
    }*/

    //res.sendStatus(202)
    const savedSqueal = await squeal.save();
    res
      .writeHead(201, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedSqueal));
  } catch(e) {
    console.error('addUser error: ' + e)
  }

}

const deleteSqueal : RequestHandler = async (req, res) => {

  const { id } = req.params;

  let boh = await SquealModel.deleteOne({ _id : id})
  

  res.end({ log: `${boh.deletedCount} deleted`})
}


export {postSqueal, getSqueals, deleteSqueal, updateSqueal};

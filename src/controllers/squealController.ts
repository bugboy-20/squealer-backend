import {RequestHandler} from "express";
import {Squeal, SquealModel} from "../models/squealModel";

const getSqueals : RequestHandler = async (req, res) => { // TODO generalizzare il codice query, channels non esiste
  try {
    const queryFilters: { [key: string]: any } = {};

    let squeals : Squeal[];

    console.log(req.query)

    if ( req.params.id )
      queryFilters.id = req.params.id;
    if ( req.query.author)
      queryFilters.author =  req.query.author;
    if ( req.query.channel)
      queryFilters.channel =  req.query.channel;
    //TODO cathegory

    squeals = await SquealModel.find(queryFilters).exec();

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


  let squealID = req.params.id;
  let opType = req.body.op;
  
  try {
    switch (opType) {
      case "viewed":
        await SquealModel.updateOne({"id": squealID}, { $inc: {"impressions":1}}); break;
      case "upvote":
        await SquealModel.updateOne({"id": squealID}, { $inc: {"positive_reaction":1}}); break;
      case "downvote":
        await SquealModel.updateOne({"id": squealID}, { $inc: {"negative_reaction":-1}}); break; //TODO controllare funzioni
    }
  } catch(e) {
    res.statusCode = 400;
    res.end('errore non aggiornato')
  }

}

/*
const findUser : RequestHandler = async (req, res) => {
  try {
    const username = req.params.username;
    const user: User = await UserModel.findOne({username}).exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(user);
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('findUser error: ' + error)
    //await fetch(...) TODO
    throw error;
  }
}
*/

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

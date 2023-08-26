import {RequestHandler} from "express";
import {now, Query} from "mongoose";
import {Squeal, SquealModel} from "../models/squealModel";

const getSqueals : RequestHandler = async (req, res) => { // TODO generalizzare il codice query, channels non esiste
  try {

    let squeals = SquealModel.find()

    if ( req.params._id )
      squeals.find({ _id : req.params._id})
    if ( req.params.channel)
      squeals.find({ receivers: req.params.channel});
    if ( req.query.author)
      squeals.find({ author:  req.query.author});
    if ( req.query.channel)
      squeals.find({ receivers:  req.query.channel})
    //TODO cathegory

    if ( req.query.page  && typeof req.query.page === "string") {
      let pNum = parseInt(req.query.page);
      squeals
        .skip(pNum*10) //TODO generalizzare
        .limit(10)
    }


    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(await squeals.exec());
    res.end(json);

  } catch (error) {
    // Handle any potential errors during the query
    console.error('getSqueals error: ' + error)
    res.statusCode = 500;
    res.end()
    //await fetch(...) TODO
    throw error;
  }
}

const updateSqueal : RequestHandler = async (req, res) => { //TODO


  let squealID : number = +req.params._id;
  let opType = req.body.op;
  let dbRes;
  
  try {
    switch (opType) {
      case "viewed":
        dbRes = await SquealModel.updateOne({"_id": squealID}, { $inc: {"impressions":1}}); break;
      case "upvote":
        dbRes = await SquealModel.updateOne({"_id": squealID}, { $inc: {"positive_reaction":1}}); break;
      case "downvote":
        dbRes = await SquealModel.updateOne({"_id": squealID}, { $inc: {"negative_reaction":-1}}); break; //TODO controllare funzioni
    }
    res.end(JSON.stringify(dbRes))
  } catch(e) {
    res.statusCode = 400;
    res.end('errore non aggiornato')
  }

}

const postSqueal : RequestHandler = async (req, res) => {

  try {
    let inSqueal : Squeal = req.body
    
    /*
    inSqueal.impressions = 0;
    inSqueal.positive_reaction = 0;
    inSqueal.negative_reaction = 0;
    inSqueal.datetime = now();
    */

    const squeal = new SquealModel(inSqueal);
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
    console.error('postSqueal error: ' + e)
    res.statusCode = 400
    res.end()
  }

}

const deleteSqueal : RequestHandler = async (req, res) => {

  try {
    const id  = req.params.id

    await SquealModel.deleteOne({ _id : id})
    

    res.end({ log: `${id} deleted`})
  } catch(e) {
    console.error(e)
    res.statusCode = 500
    res.end()
  }
}


export {postSqueal, getSqueals, deleteSqueal, updateSqueal};

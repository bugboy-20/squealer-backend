import {RequestHandler} from "express";
import {Squeal, SquealModel} from "../models/squealModel";
import {catchServerError} from "../utils/controllersUtils";

const getSqueals : RequestHandler = catchServerError( async (req, res) => {

    let squeals = SquealModel.find()

    console.log(req.params.id)
    if ( req.params.id )
      squeals.find({_id: req.params.id})
    if ( req.params.channelName)
      squeals.find({ receivers: req.params.channelName});
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

  })

const updateSqueal : RequestHandler = catchServerError( async (req, res) => { //TODO


  let squealID = req.params.id;
  let opType = req.body.op;
  let dbRes;
  
    switch (req.body.op) {
      case "viewed":
        opType = { $inc: {"impressions":1}}; break
      case "upvote":
        opType = { $inc: {"positive_reaction":1}}; break
      case "downvote":
        opType = { $inc: {"negative_reaction":1}}; break
      default: res.statusCode = 400; opType = {}; break
    }

    dbRes = SquealModel.findOneAndUpdate({_id: squealID}, opType, { new: true});
    res.end(JSON.stringify(await dbRes?.exec()))

})

const postSqueal : RequestHandler = catchServerError( async (req, res) => {

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
  },400,'postSqueal error: ')

const deleteSqueal : RequestHandler = catchServerError( async (req, res) => {

    const id  = req.params.id

    await SquealModel.deleteOne({ _id : id})
    

    res.end({ log: `${id} deleted`})
})


export {postSqueal, getSqueals, deleteSqueal, updateSqueal};

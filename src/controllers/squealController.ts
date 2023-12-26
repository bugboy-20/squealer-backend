import { Middleware } from "polka";

import {SquealUser, SquealModel} from "../models/squealModel";
import { User, UserModel } from "../models/userModel";

import {catchServerError} from "../utils/controllersUtils";
import {mutateReactions, squeal4NormalUser, stringifyGeoBody} from "../utils/SquealUtils";
import { RequestHandler } from "express";

const getSqueals : Middleware = catchServerError( async (req, res) => {

    let squeals = SquealModel.find()

    if ( req.params.id ) {
      let json = await squeals.findOne({_id: req.params.id}).exec()
      if(json) {
        console.log(json)
        res.json(await squeal4NormalUser(json))
      }
      else
        res.status(404).end("Squeal doesn't exist");
      return
    }
    if ( req.params.channelName)
      squeals.find({ receivers: req.params.channelName});
    if (req.query.author) {
      squeals.find({ author: { $regex: req.query.author, $options: "i" } });
    }
    if ( req.query.receiver) {
      squeals.find({ receivers: { $regex: req.query.receiver, $options: "i" }});
    }
    if(req.query.date){
      let date = new Date(req.query.date as string)
      squeals.find({ datetime: { $gte: date } })
    }
    if ( req.query.channel)
      squeals.find({ receivers:  req.query.channel})
    //TODO cathegory

    if ( req.query.page  && typeof req.query.page === "string") {
      let pNum = parseInt(req.query.page);
      squeals
        .skip(pNum*10) //TODO generalizzare
        .limit(10)
    }
    if ( req.query.query && typeof req.query.query === "string") {
      if(req.query.query.startsWith('@'))
        squeals.find({ "body.content": { $regex: new RegExp(req.query.query), $options: 'i' }})
      else if(req.query.query.startsWith('#') || req.query.query.startsWith('§'))
        squeals.find({
          $or: [
            { receivers: { $regex: new RegExp(req.query.query), $options: 'i' }},
            { "body.content": { $regex: new RegExp(req.query.query), $options: 'i' }},
          ]
        })
    }

    squeals.sort("-datetime")

    try {
      res.json((await squeals.exec()).map(s => squeal4NormalUser(s)));
    } catch(e) {
      console.log('AAAAAAAAAAAAAA')
      console.trace()
      throw e
    }
  })

const updateSqueal : Middleware = catchServerError( async (req, res) => { //TODO gestire con autenticazione


  let squealID = req.params.id;
  let opType = req.body.op;
  
    switch (req.body.op) {
      case "viewed":
        opType = { $push: {"impressions":req.auth.username}}; break
      case "upvote":
        opType = { $push: {"positive_reaction":req.auth.username}}; break
      case "downvote":
        opType = { $push: {"negative_reaction":req.auth.username}}; break
      default: res.statusCode = 400; opType = {}; break
    }

    SquealModel.findOneAndUpdate({_id: squealID}, opType, { new: true}).exec().then(dbRes => {
      if (dbRes)
        res.json(squeal4NormalUser(dbRes))
      else {
        res.status(404).end();
      }
    }).catch(e => {console.error('Errore' + JSON.stringify(e)); res.status(404).end()})

})

const postSqueal : Middleware = catchServerError( async (req, res) => {

    let inSqueal : SquealUser = stringifyGeoBody(req.body);
    
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

    res.status(201).json(squeal4NormalUser(savedSqueal));
  },400,'postSqueal error: ')

const deleteSqueal : Middleware = catchServerError( async (req, res) => {

    const id  = req.params.id

    await SquealModel.deleteOne({ _id : id})
    
    res.json({ log: `${id} deleted`})
})

const addReceiver: RequestHandler = catchServerError(async (req, res) => {
  const squealId = req.params.id;
  const receiver = req.body.receiver;
  const squeal = await SquealModel.findOne({ _id: squealId }).exec();
  if (!squeal) {
    res.status(404).end("Squeal doesn't exist");
    return;
  }
  if (squeal.receivers.includes(receiver)) {
    res.status(409).end("Receiver already exists");
    return;
  }
  squeal.receivers.push(receiver);
  await squeal.save();
  res.json(squeal4NormalUser(squeal));
})

const changeReactions: RequestHandler = catchServerError(async (req, res) => {
  const squeal = await SquealModel.findOne({ _id: req.params.id }).exec();
  if (!squeal) {
    res.status(404).end();
    return;
  }
  const {positive, negative} = req.body;

  if(typeof positive !== "number" && typeof negative !== "number") {
    res.status(400).end("Reactions should be numbers");
    return;
  }
  if (positive < 0 || negative < 0) {
    res.status(400).end("Reactions must be positive");
    return;
  }

  squeal.positive_reaction = mutateReactions(squeal.positive_reaction, positive, req.auth.username)
  squeal.negative_reaction = mutateReactions(squeal.negative_reaction, negative, req.auth.username);
  await squeal.save()

  res.json(squeal4NormalUser(squeal));
})

export {postSqueal, getSqueals, deleteSqueal, updateSqueal, addReceiver, changeReactions};

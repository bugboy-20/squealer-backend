
import { RequestHandler } from "express";

import {SquealModel} from "../models/squealModel";

import {catchServerError} from "../utils/controllersUtils";
import {mutateReactions, squeal4NormalUser, stringifyGeoBody} from "../utils/SquealUtils";
import { squealRead_t } from "../validators/squealValidators";
import { findVisibleChannels } from "../utils/channelUtils";

const getSqueals : RequestHandler = catchServerError( async (req, res) => {

    const isAuth = req.auth.isAuth;
    const authUsername = req.auth.username;

    const { visibleChannels } = await findVisibleChannels(isAuth, authUsername)
    console.log("visibleChannels", visibleChannels)

    const squeals = SquealModel.find({ receivers: { $in: visibleChannels } });


    if (req.params.id) {
      //TODO valutare di sportre
      const json = await squeals.findOne({ _id: req.params.id }).exec();
      if (json) {
        const response = await squeal4NormalUser(json, {
          isAuth,
          authUsername
        });
        if (response) return res.json(response);
      }

      return res.status(404).end("Squeal doesn't exist");

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

    const result = await squeals.exec();
    const response = (
      await Promise.all(
        result.map((s) => squeal4NormalUser(s, { isAuth, authUsername }))
      )
    ).filter((s): s is squealRead_t => s !== null);
    res.json(response);
  })

const updateSqueal : RequestHandler = catchServerError( async (req, res) => { //TODO gestire con autenticazione


  let squealID = req.params.id;
  const dbRes = await SquealModel.findOne({_id: squealID}).exec();
  if(!dbRes){
    res.sendStatus(404);
    return;
  }
  
    switch (req.body.op) {
      case "viewed":
        dbRes.impressions.push(req.auth.username); break
      case "upvote":
        dbRes.positive_reaction.push(req.auth.username); break
      case "downvote":
        dbRes.negative_reaction.push(req.auth.username); break
    }

    dbRes.save();

    const out = await squeal4NormalUser(dbRes, {isAuth: req.auth.isAuth, authUsername: req.auth.username});
    if(out)
      res.json(out);
    else
      res.sendStatus(404);
})

const postSqueal : RequestHandler = catchServerError( async (req, res) => {

    let inSqueal = stringifyGeoBody(req.body);

    const squeal = new SquealModel(inSqueal);
    squeal.author = req.auth.username;
    /*const existingUser = await UserModel.findOne({ username: user.username }).exec();

    if (existingUser) {
      res.statusCode = 409
      return res.json({ message: 'Username already taken' });
    }*/

    //res.sendStatus(202) 

    try {
      const savedSqueal = await squeal.save();
      const out = await squeal4NormalUser(savedSqueal)
      if(!out){
        res.sendStatus(404)
      }
      res.status(201).json(out);    
    } catch (e) {
      res.status(400).json({message : e})
    }



  },400,'postSqueal error: ')

const deleteSqueal : RequestHandler = catchServerError( async (req, res) => {

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

  const out = await squeal4NormalUser(squeal);
  if(!out){
    res.sendStatus(404)
  }
  res.json(out);
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

  const out = await squeal4NormalUser(squeal);
  if(!out){
    res.sendStatus(404)
  }
  res.json(out);
})

const getNotifications : RequestHandler = catchServerError ( async (req,res) => {
  const user = req.auth.username
  
  let squeals = await SquealModel.find({$and:[
    { receivers: { $in: [user] }},
    { impressions: { $nin : [user] }}
  ]})

  res.json(await Promise.all(squeals.map(s => squeal4NormalUser(s))))

})

export {postSqueal, getSqueals, deleteSqueal, updateSqueal, addReceiver, changeReactions, getNotifications};

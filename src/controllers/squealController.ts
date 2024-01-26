
import { RequestHandler } from "express";

import {Squeal, SquealModel} from "../models/squealModel";

import {catchServerError} from "../utils/controllersUtils";
import {mutateReactions, squeal4NormalUser, stringifyGeoBody} from "../utils/SquealUtils";
import { looseSquealRead_t } from "../validators/squealValidators";
import { findVisibleChannels } from "../utils/channelUtils";
import { automaticChannelsList } from "../utils/automaticChannels";
import { featureCollection_t } from "../validators/utils/geojson";

const getSqueals : RequestHandler = catchServerError( async (req, res) => {

    const isAuth = req.auth.isAuth;
    const authUsername = req.auth.username;

    const {notVisibleChannels} = await findVisibleChannels(isAuth, authUsername)
    const squeals = SquealModel.find({ receivers: { $nin: notVisibleChannels } });
    let automaticSqueals: looseSquealRead_t[] = [];

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

      return res.status(404).json("Squeal doesn't exist");

    }
    if( req?.auth.isAuth && req.query.from && typeof req.query.from === "string"){
      // devo restituire gli squeal che l'utente in from mi ha scritto
      // e che non hanno destinatari che non iniziano con @
      // questi saranno gli squeal diretti 
      squeals.find({ author: req.query.from, $and: [
          { receivers: authUsername },
          { receivers: { $not: { $regex: '^[^@]', $options: 'i' } } },
        ] })
    }
    if ( req.params.channelName || (req.query.channel && typeof req.query.channel === "string") )
    {
      const channelName = req.params.channelName ?? req.query.channel;
      squeals.find({ receivers: channelName});
      automaticSqueals = await automaticChannelsList[channelName]?.() ?? [];
    }
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
    if ( req.query.page  && typeof req.query.page === "string") {
      let pNum = parseInt(req.query.page);
      squeals
        .skip(pNum*10) //TODO generalizzare
        .limit(10)
      
      // implement pagination with external data
      automaticSqueals = automaticSqueals.slice(pNum*10, pNum*10+10)
    }
    if ( req.query.query && typeof req.query.query === "string") {
      if(req.query.query.startsWith('@'))
        squeals.find({ "body.type": "text", "body.content": { $regex: new RegExp(req.query.query), $options: 'i' }})
      else
        squeals.find({
          $or: [
            { receivers: { $regex: new RegExp(req.query.query), $options: 'i' }},
            { "body.type": "text", "body.content": { $regex: new RegExp(req.query.query), $options: 'i' }},
          ]
        })
    }

    squeals.sort("-datetime")

    const result = (
      await Promise.all(
        (await squeals.exec()).map((s) => squeal4NormalUser(s, { isAuth, authUsername }))
      )
    ).filter((s): s is looseSquealRead_t => s !== null);
    res.json(automaticSqueals.concat(result));
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

    await dbRes.save({disableQuota: true});

    const out = await squeal4NormalUser(dbRes, {isAuth: req.auth.isAuth, authUsername: req.auth.username});
    if(out)
      res.json(out);
    else
      res.sendStatus(404);
})

const postSqueal : RequestHandler = catchServerError( async (req, res) => {

    let inSqueal = stringifyGeoBody(req.body);

    const squeal = new SquealModel(inSqueal);
    if(!squeal?.author || req.auth.usertype === "standard")
      squeal.author = req.auth.username;

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
    res.status(404).json("Squeal doesn't exist");
    return;
  }
  if (squeal.receivers.includes(receiver)) {
    res.status(409).json("Receiver already exists");
    return;
  }
  squeal.receivers.push(receiver);
  await squeal.save({disableMiddleware: true});

  const out = await squeal4NormalUser(squeal);
  if(!out){
    res.sendStatus(404)
  }
  res.json(out);
})

const changeReactions: RequestHandler = catchServerError(async (req, res) => {
  const squeal = await SquealModel.findOne({ _id: req.params.id }).exec();
  if (!squeal) {
    res.status(404).json();
    return;
  }
  const {positive, negative} = req.body;

  if(typeof positive !== "number" && typeof negative !== "number") {
    res.status(400).json("Reactions should be numbers");
    return;
  }
  if (positive < 0 || negative < 0) {
    res.status(400).json("Reactions must be positive");
    return;
  }

  squeal.positive_reaction = mutateReactions(squeal.positive_reaction, positive, req.auth.username)
  squeal.negative_reaction = mutateReactions(squeal.negative_reaction, negative, req.auth.username);
  await squeal.save({disableQuota: true})

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

const getInerractions : RequestHandler = catchServerError( async (req, res) => {

  const sqID = req.params.id
  if(!sqID)
    throw new Error('id non definito')

  const squeal : Squeal = await SquealModel.findOne({ _id: sqID }).exec().then(s => { if(!s) {throw Error('id incorretto?')} else return s })

  const objres = {
    positives: squeal.positive_reaction,
    negatives: squeal.negative_reaction,
    impressions: squeal.impressions
  }
  res.json(objres)
})

const updateTimedSqueals : RequestHandler = catchServerError( async (req, res) => {
  const referenceID = req.params.id;
  const {coords} = req.body;
  const timedSqueal = await SquealModel.findOne({ _id: referenceID }).exec();
  if(!timedSqueal || timedSqueal.body.type !== 'geo') {
    res.status(404).json("Squeal doesn't exist");
    return;
  }
  const squealContent: featureCollection_t = JSON.parse(timedSqueal.body.content)
  squealContent.features.push({
    type: 'Feature',
    properties: {
      popup: `posizione`,
    },
    geometry: {
      type: 'Point',
      coordinates: [coords.longitude, coords.latitude],
    },
  });
  squealContent.center = [coords.latitude, coords.longitude];

  timedSqueal.body.content = JSON.stringify(squealContent);
  await timedSqueal.save({disableMiddleware: true});

  const out = await squeal4NormalUser(timedSqueal, {isAuth: req.auth.isAuth, authUsername: req.auth.username});
  if(!out){
    res.sendStatus(404)
  }
  res.json(out);
})

export {postSqueal, getSqueals, deleteSqueal, updateSqueal, addReceiver, changeReactions, getNotifications, getInerractions, updateTimedSqueals};

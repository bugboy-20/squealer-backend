import { Middleware } from "polka";
import {Squeal, SquealModel} from "../models/squealModel";
import {catchServerError} from "../utils/controllersUtils";
import {squeal4NormalUser} from "../utils/SquealUtils";

const getSqueals : Middleware = catchServerError( async (req, res) => {

    let squeals = SquealModel.find()

    if ( req.params.id ) { //TODO valutare di sportre
      let json = await squeals.findOne({_id: req.params.id}).exec()
      if(json)
        res.json(squeal4NormalUser(json))
      return
    }
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


    res.json((await squeals.exec()).map(s => squeal4NormalUser(s)));
  })

const updateSqueal : Middleware = catchServerError( async (req, res) => { //TODO gestire con autenticazione


  let squealID = req.params.id;
  let opType = req.body.op;
  let dbRes;
  
    switch (req.body.op) {
      case "viewed":
        opType = { $push: {"impressions":req.params.authUsername}}; break
      case "upvote":
        opType = { $push: {"positive_reaction":req.params.authUsername}}; break
      case "downvote":
        opType = { $push: {"negative_reaction":req.params.authUsername}}; break
      default: res.statusCode = 400; opType = {}; break
    }

    dbRes = await SquealModel.findOneAndUpdate({_id: squealID}, opType, { new: true}).exec()
    if (dbRes)
      res.json(dbRes)
    else {
      res.statusCode = 404
      res.end()
    }

})

const postSqueal : Middleware = catchServerError( async (req, res) => {

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

const deleteSqueal : Middleware = catchServerError( async (req, res) => {

    const id  = req.params.id

    await SquealModel.deleteOne({ _id : id})
    

    res.end({ log: `${id} deleted`})
})


export {postSqueal, getSqueals, deleteSqueal, updateSqueal};

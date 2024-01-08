
import {RequestHandler} from 'express';
import {Channel, ChannelModel} from '../models/channelModel';
import { User, UserModel } from '../models/userModel';
import {addSubcribedInfo} from '../utils/channelUtils';
import {catchServerError} from '../utils/controllersUtils';
import { channelSchema } from '../validators/channelValidator';

/* TODO
 * controlli sul tipo di canali che un utente può creare
 */


const addChannel : RequestHandler = catchServerError(
  async (req, res) => {
    const channelName = req.body.name;
    const channel = await ChannelModel.findOne({ name: channelName }).exec();
    if (channel) {
      res.status(409).json({ error: `Channel ${channelName} already exists` });
      return;
    }
    const log = new ChannelModel(channelSchema.parse(req.body));
    const savedChannel = await log.save();
    res.json(channelSchema.parse(savedChannel));
  }
  ,500)

const getChannels : RequestHandler = catchServerError(async (req, res) => {
    let channels = ChannelModel.find()

    if( req.params.channelName ) {
      const channelName = req.params.channelName
      channels.findOne({ name: channelName })
    }
    let subscribedChannels = ( await UserModel.findOne({ username : req.auth.username }) as User).subscriptions

    if ( req.query.subscribed === "true" && req.auth.isAuth) {
      channels.find({ name : {$in: subscribedChannels }})
    }

    if ( req.query.type)
      channels.find({type : req.query.type, name : {$in: subscribedChannels }})

    if ( req.query.official ) {
      let official : boolean
      try {
        official = JSON.parse( req.query.official as string )
      } catch(_) {
        return res.status(417).json( { error: `official has to be boolean, found "${req.query.official}"`})
      }
      if (official)
        channels.find({
          name: {
            $regex: /^§[A-Z]+.*$/
          }
        })
      else
        channels.find({
          name: {
            $regex: /^§[a-z]+.*$/
          }
        })
    }


    const chq : Channel | Channel[] | null = await channels.exec()
    if(!chq)
      res.statusCode = 404
        
    if(req?.auth.isAuth && chq) {
      res.json(await addSubcribedInfo(chq,req.auth.username))
      return
    }

    res.json(chq)

},500)

const changeDescription : RequestHandler = catchServerError(async (req, res) => {
  const newDescription = req.body.description
  const channel = await ChannelModel.findOne({ name: req.params.channelName })
  if(!channel){
    res.status(404).json({error: `Channel ${req.params.channelName} not found`})
    return
  }
  if(!newDescription){
    res.status(400).json({error: `Missing new description`})
    return
  }

  channel.description = newDescription
  const savedChannel = await channel.save()
  res.json(channelSchema.parse(savedChannel))

},500)

const deleteChannel : RequestHandler = catchServerError(async (req, res) => {
  const channelName = req.params.channelName;
  const deletedChannel = await ChannelModel.findOneAndDelete({ name: channelName }).exec();
  if (deletedChannel) {
    console.log(`Channel ${channelName} has been deleted.`);
    res.json(channelSchema.parse(deletedChannel));
  } else {
    console.log(`Channel ${channelName} not found.`);
    res.set('X-Error-Code', 'channel not found')
    res.status(404).json({error: `Channel ${channelName} not found`});
  }
},500)

export {addChannel, getChannels, changeDescription, deleteChannel};

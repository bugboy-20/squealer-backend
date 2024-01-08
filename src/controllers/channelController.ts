
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
  const officialRegex = /^§[A-Z]+.*$/
  const nonOfficialRegex = /^§[a-z]+.*$/

  const subscribedChannels = ( await UserModel.findOne({ username : req.auth.username }))?.subscriptions ?? []
  const publicChannels = await ChannelModel.find({ type : "public" }).then( channels => channels.map( channel => channel.name ) )
  const visibleChannels = subscribedChannels.concat(publicChannels)

  const channels = ChannelModel.find({name : {$in: visibleChannels }})

  if( req.params.channelName ) {
    const channelName = req.params.channelName;
    // if not authenticated, only official channels are visible
    if( !req?.auth.isAuth && officialRegex.test(channelName) )
      channels.findOne({ name: channelName })
    // if authenticated, only subscribed and public channels are visible
    else if( req?.auth.isAuth )
      channels.findOne({ name: { $regex: channelName, $in: visibleChannels } })
    else {
      res.sendStatus(404)
      return;
    }
  }
  else if(req?.auth.isAuth) {
    if ( req.query.subscribed === "true" )
      channels.find({ name : {$in: subscribedChannels }})

    if ( req.query.type)
      channels.find({type : req.query.type})

    if ( req.query.official === 'true' )
      channels.find({
        name: {$regex: officialRegex}
      })
    else if ( req.query.official === 'false' )
      channels.find({
        name: {$regex: nonOfficialRegex}
      })
  }
  else 
    channels.find({
      name: {$regex: officialRegex}
    });
  

  const result : Channel | Channel[] | null = await channels.exec()
  if(!result){
    res.sendStatus(404)
    return;
  }

  if(req?.auth.isAuth) {
    res.json(await addSubcribedInfo(result,req.auth.username))
    return
  }

  res.json(result)

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

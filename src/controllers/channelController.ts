
import {RequestHandler} from 'express';
import {Channel, ChannelModel} from '../models/channelModel';
import {addSubcribedInfo, findVisibleChannels} from '../utils/channelUtils';
import {catchServerError} from '../utils/controllersUtils';
import { channelSchema } from '../validators/channelValidator';
import { nonOfficialChannelRegex, officialChannelRegex } from '../validators/utils/regex';
import { UserModel } from '../models/userModel';

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
  const { subscribedChannels, visibleChannels } = await findVisibleChannels(req.auth.isAuth, req.auth.username)


  const channels = ChannelModel.find({name : {$in: visibleChannels }})

  if( req.params.channelName ) {
    const channelName = req.params.channelName;
    // if not authenticated, only official channels are visible
    if( !req?.auth.isAuth && officialChannelRegex.test(channelName) )
      channels.findOne({ name: channelName })
    // if authenticated and channelName is a username, the user wants the direct channel
    else if( req?.auth.isAuth && channelName.startsWith('@') ){
      const user = await UserModel.findOne({ username: channelName })
      if(!user){
        res.sendStatus(404)
        return;
      }
      res.json({
        name: channelName,
        type: "direct",
        description: `Canale diretto con ${user.username}`,
      });
      return;
    }
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
        name: {$regex: officialChannelRegex}
      })
    else if ( req.query.official === 'false' )
      channels.find({
        name: {$regex: nonOfficialChannelRegex}
      })
  }

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

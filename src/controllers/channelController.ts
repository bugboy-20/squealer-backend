
import {RequestHandler} from 'express';
import {Channel, ChannelModel} from '../models/channelModel';
import {addSubcribedInfo} from '../utils/channelUtils';
import {catchServerError} from '../utils/controllersUtils';

/* TODO
 * controlli sul tipo di canali che un utente può creare
 */


const addChannel : RequestHandler = catchServerError(
  async (req, res) => {

    const log = new ChannelModel(req.body);
    const savedChannel = await log.save();
    res.json(savedChannel);
  }
  ,500
  ,'Error in addChannel: ')

const getChannels : RequestHandler = catchServerError(async (req, res) => {
    let channels = ChannelModel.find()

    if( req.params.channelName ) {
      const channelName = req.params.channelName
      channels.findOne({ name: channelName })
    }

    if ( req.query.type)
      channels.find({type : req.query.type})

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

},500,'Error in listAllChannels')

export {addChannel, getChannels};

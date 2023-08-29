
import {RequestHandler} from 'express';
import {Channel, ChannelModel} from '../models/channelModel';
import {catchServerError} from '../utils/controllersUtils';

/* TODO
 * controlli sul tipo di canali che un utente può creare
 */


const addChannel : RequestHandler = catchServerError(
  async (req, res) => {

    const log = new ChannelModel(req.body);
    const savedChannel = await log.save();
    res
      .writeHead(200, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedChannel))
  }
  ,500
  ,'Error in addChannel: ')

const getChannels : RequestHandler = catchServerError(async (req, res) => {
    let channels = ChannelModel.find()

    if( req.params.channelName ) {
      const channelName = req.params.channelName.replace(/%C2%A7/i, '§') // '§' issue
      channels.find({ name: channelName })
    }

    if ( req.query.type)
      channels.find({type : req.query.type})

    if ( req.query.official ) {
      let official : boolean
      try {
        official = JSON.parse( req.query.official as string )
      } catch(_) {
        res.statusCode = 417
        res.end(JSON.stringify( { error: `official has to be boolean, found "${req.query.official}"`}))
        return
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


    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(await channels.exec());
    res.end(json);
},404,'Error in listAllChannels')

export {addChannel, getChannels};

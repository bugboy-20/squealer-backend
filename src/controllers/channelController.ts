
import {RequestHandler} from 'express';
import {Channel, ChannelModel} from '../models/channelModel';
import {send404} from '../utils/statusSenders';

/* TODO
 * controlli sul tipo di canali che un utente può creare
 */


const addChannel : RequestHandler = async (req, res) => {

  try {
    const log = new ChannelModel(req.body);
    const savedChannel = await log.save();
    res
      .writeHead(200, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedChannel));
  } catch(e) {
    console.error('Error in addChannel: ' + e);
    res.end(JSON.stringify(req.body, null, 2))
  }

}

const getChannels : RequestHandler = async (req, res) => {
  try {
    let channels = ChannelModel.find()
    const channelName = req.params.channelName.replace(/%C2%A7/i, '§') // '§' issue
    if( channelName )
      channels.find({ name: channelName })

    if ( req.query.type)
      channels.find({type : req.query.type})
    

    console.log(channels.getFilter())
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(await channels.exec());
    res.end(json);
    //res.status(200).json(channels);
    //res.json(channels);
  } catch (error) {
    // Handle any potential errors during the query
    send404(req,res);
    console.error('Error in listAllChannels');
    throw error;
  }
}

export {addChannel, getChannels};

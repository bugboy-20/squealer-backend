
import {RequestHandler} from 'express';
import {Channel, ChannelModel} from '../models/channelModel';

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
    let channels: Channel[];
    const { channelName } = req.body;
    if( channelName ) {
      channels = await ChannelModel.find({ name: channelName }).exec();
    }
    else {
      channels = await ChannelModel.find().exec();
    }
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(channels);
    res.end(json);
    //res.status(200).json(channels);
    //res.json(channels);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('Error in listAllChannels');
    throw error;
  }
}

export {addChannel, getChannels};

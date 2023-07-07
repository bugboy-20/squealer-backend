import {RequestHandler} from 'express';
import {Log,LogModel} from '../models/logModel'


const addLog : RequestHandler = async (req, res) => {

  try {
    const log = new LogModel(req.body);
    const savedLog = await log.save();
    res.end(savedLog);
  } catch(e) {
    console.error('Error in addLog');
    res.end('fail');
  }

}

const listAllLogs : RequestHandler = async (req, res) => {
  try {
    const logs: Log[] = await LogModel.find().exec();
    res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('Error in listAllLogs');
    throw error;
  }
}

export {addLog, listAllLogs};

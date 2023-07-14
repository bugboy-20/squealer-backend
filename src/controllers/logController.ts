import {RequestHandler} from 'express';
import {Log,LogModel} from '../models/logModel'


const addLog : RequestHandler = async (req, res) => {

  try {
    const log = new LogModel(req.body);
    const savedLog = await log.save();
    res
      .writeHead(200, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedLog));
  } catch(e) {
    console.error('Error in addLog: ' + e);
    res.end(JSON.stringify(req.body, null, 2))
  }

}

const listAllLogs : RequestHandler = async (req, res) => {
  try {
    const logs: Log[] = await LogModel.find().exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(logs.reverse());
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
  } catch (error) {
    // Handle any potential errors during the query
    console.error('Error in listAllLogs');
    throw error;
  }
}

export {addLog, listAllLogs};

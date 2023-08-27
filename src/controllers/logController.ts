import {RequestHandler} from 'express';
import {Log,LogModel} from '../models/logModel'
import {catchServerError} from '../utils/controllersUtils';


const addLog : RequestHandler = catchServerError( async (req, res) => {

    const log = new LogModel(req.body);
    const savedLog = await log.save();
    res
      .writeHead(200, {'Content-Type': 'application/json'})
      .end(JSON.stringify(savedLog));

})

const listAllLogs : RequestHandler = catchServerError( async (req, res) => {
    const logs: Log[] = await LogModel.find().exec();
     res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    let json = JSON.stringify(logs.reverse());
    res.end(json);
    //res.status(200).json(logs);
    //res.json(logs);
})

export {addLog, listAllLogs};

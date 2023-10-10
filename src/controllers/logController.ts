import {RequestHandler} from 'express';
import {Log,LogModel} from '../models/logModel'
import {catchServerError} from '../utils/controllersUtils';


const addLog : RequestHandler = catchServerError( async (req, res) => {

    const log = new LogModel(req.body);
    const savedLog = await log.save();
    res.json(savedLog);

})

const listAllLogs : RequestHandler = catchServerError( async (req, res) => {
    const logs: Log[] = await LogModel.find().exec();
    res.json(logs.reverse())
})

export {addLog, listAllLogs};

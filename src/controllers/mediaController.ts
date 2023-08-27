import multer from 'multer'; // For handling multipart/form-data
import path from 'path';
import {RequestHandler} from 'express';
import {send501} from '../utils/statusSenders';
import {catchServerError} from '../utils/controllersUtils';


const uploadMedia : RequestHandler = catchServerError( async (req,res) => {
    if (!req.file) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: 'No media file uploaded' }));
    }

    // TODO Here, you can process the uploaded media file if needed

    const mediaUrl = 'https://example.com/media/' + path.basename(req.file.originalname);

    res.statusCode = 200;
    res.end(JSON.stringify({ url: mediaUrl }))

  }
  ,500
  ,'Error occurred while uploading media:'
  ,JSON.stringify({ message: 'Internal Server Error' }))

const getMedia : RequestHandler = send501;

export { uploadMedia , getMedia}


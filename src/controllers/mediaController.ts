import multer from 'multer'; // For handling multipart/form-data
import path from 'path';
import {RequestHandler} from 'express';


const uploadMedia : RequestHandler = async (req,res) => {
  try {
    if (!req.file) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: 'No media file uploaded' }));
    }

    // TODO Here, you can process the uploaded media file if needed

    const mediaUrl = 'https://example.com/media/' + path.basename(req.file.originalname);

    res.statusCode = 200;
    res.end(JSON.stringify({ url: mediaUrl }))

  } catch (error) {
    console.error('Error occurred while uploading media:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}

export { uploadMedia }


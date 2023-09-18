import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { MediaModel } from '../models/mediaModel';
import { catchServerError } from '../utils/controllersUtils';
import { bucket } from '../db_utils';

const uploadMedia: RequestHandler = catchServerError(
  async (req, res) => {
    const file = req.file;
    if (!file) {
      res.writeHead(400, {
        'Content-Type': 'application/json'
      })
      return res.end(JSON.stringify({ message: 'No media file uploaded' }));
    }

    const uploadStream = bucket.openUploadStream(file.originalname);
    const id = uploadStream.id;
    uploadStream.end(file.buffer);

    // Save metadata to Media collection
    const mediaMetadata = new MediaModel({
      filename: file.originalname,
      contentType: file.mimetype,
      fileId: id,
    });
    mediaMetadata.save();

    
    const mediaUrl = `https://${process.env.VIRTUAL_HOST}/api/media/${id}`;

    res.writeHead(200, {
      'Content-Type': 'text/plain'
    })
    res.end(mediaUrl);
  },
  500,
  'Error occurred while uploading media:'
  ,()=>{});

const getMedia: RequestHandler = catchServerError((req, res) => {
  let fileId;
  try {
    fileId = new mongoose.mongo.ObjectId(req.params.id);
  } catch (err) {
    res.writeHead(400, {
      'Content-Type': 'application/json'
    })
    return res.end(
      JSON.stringify({ message: 'Invalid media ID in URL parameter' })
    );
  }

  const downloadStream = bucket.openDownloadStream(fileId);
  downloadStream.pipe(res);

  downloadStream.on('error', () => {
    res.writeHead(400, {
      'Content-Type': 'application/json'
    })
    return res.end(JSON.stringify({ message: 'Error while fetching file' }));
  });
});

export { getMedia, uploadMedia };

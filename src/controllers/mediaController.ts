import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { catchServerError } from '../utils/controllersUtils';
import { bucket } from '../db_utils';
import sharp from 'sharp';

export const compressMedia: RequestHandler = catchServerError(
  async (req, res, next) => {
    const file = req.file;
    if (!file) {
      res.writeHead(400, {
        'Content-Type': 'application/json',
        Accept: 'image/*, video/*',
      });
      return res.end(JSON.stringify({ message: 'No media file uploaded' }));
    }
    if (file.mimetype.startsWith('video/')) return next();

    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.format) {
      return next();
    }

    file.buffer = await sharp(file.buffer)
      .toFormat(metadata.format, { quality: 70, mozjpeg: true }) // Use the input format for output
      .toBuffer();

    next();
  }
);

const uploadMedia: RequestHandler = catchServerError(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.writeHead(400, {
      'Content-Type': 'application/json',
      Accept: 'image/*, video/*',
    });
    return res.end(JSON.stringify({ message: 'No media file uploaded' }));
  }

  const uploadStream = bucket.openUploadStream(file.originalname, {
    contentType: file.mimetype,
  });

  uploadStream.on('error', () => {
    res.writeHead(500, {
      'Content-Type': 'application/json',
      Accept: 'image/*, video/*',
    });
    return res.end(
      JSON.stringify({ message: 'Error uploading file to database' })
    );
  });

  uploadStream.on('finish', () => {
    const mediaUrl = `${req.headers['x-forwarded-proto'] ?? 'http'}://${
      req.headers.host
    }${req.url}${uploadStream.id}`;

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      Accept: 'image/*, video/*',
    });
    res.end(mediaUrl);
  });

  uploadStream.end(file.buffer);
});

const getMedia: RequestHandler = catchServerError((req, res) => {
  let fileId;
  try {
    fileId = new mongoose.mongo.ObjectId(req.params.id);
  } catch (err) {
    res.writeHead(400, {
      'Content-Type': 'application/json',
    });
    return res.end(
      JSON.stringify({ message: 'Invalid media ID in URL parameter' })
    );
  }

  const downloadStream = bucket.openDownloadStream(fileId);
  downloadStream.pipe(res);

  downloadStream.on('error', (err) => {
    console.error(err);

    res.writeHead(400, {
      'Content-Type': 'application/json',
    });
    return res.end(JSON.stringify({ message: 'Error while fetching file' }));
  });
});

export { getMedia, uploadMedia };

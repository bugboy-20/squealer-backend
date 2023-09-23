import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { catchServerError } from '../utils/controllersUtils';
import { bucket } from '../db_utils';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import stream from 'stream';
import tmp from 'tmp-promise';
import fs from 'fs';

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

    console.log(
      `Before compressing ${Math.floor(
        Buffer.byteLength(file.buffer) / 1024
      )} KB`
    );
    let compressedBuffer: Buffer | undefined = undefined;

    try {
      if (file.mimetype.startsWith('image/')) {
        // the file is an image
        const metadata = await sharp(file.buffer).metadata();
        if (!metadata.format) {
          return next();
        }

        compressedBuffer = await sharp(file.buffer)
          .toFormat(metadata.format, { quality: 70, mozjpeg: true }) // Use the input format for output
          .toBuffer();

        if (compressedBuffer) file.buffer = compressedBuffer;
        console.log(
          `After compressing ${Math.floor(
            Buffer.byteLength(file.buffer) / 1024
          )} KB`
        );
        next();
      } else {
        const { path, cleanup } = await tmp.dir({
          unsafeCleanup: true,
        });
        const inputFilePath = `${path}/${file.originalname}`;
        fs.writeFileSync(inputFilePath, file.buffer);

        const outputfilePath = `${path}/tmp_${file.originalname}`;

        // Create a FFmpeg command to optimize the video
        ffmpeg(inputFilePath)
          .output(outputfilePath)
          .videoCodec('libx264') // Set video codec for compression
          .audioCodec('aac') // Set audio codec
          .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
          })
          .on('end', () => {
            file.buffer = fs.readFileSync(outputfilePath);
            cleanup();
            console.log(
              `After compressing ${Math.floor(
                Buffer.byteLength(file.buffer) / 1024
              )} KB`
            );
            next();
          })
          .on('error', (err) => {
            console.error('Error optimizing mammt ', err);
            cleanup();
            next();
          })
          .run();
      }
    } catch (error) {
      // if something goes wrong, just continue with the original file
      console.error(error);
      console.log('Error compressing media file');
      next();
    }
  },
  500,
  'Error compressing media file',
  () => {
    return 'Error compressing media file';
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
    }/api/media/${uploadStream.id}`;

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

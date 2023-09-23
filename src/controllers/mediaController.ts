import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { catchServerError } from '../utils/controllersUtils';
import { bucket } from '../db_utils';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import stream from 'stream';

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
      } else {
        // if the file is not an image, it must be a video
        const inputStream = stream.Readable.from(file.buffer, {
          objectMode: false,
        });

        // Create a writable stream to collect the optimized video
        const outputStream = new stream.PassThrough();

        // Create a FFmpeg command to optimize the video
        const command = ffmpeg(inputStream)
          .videoCodec('libx264') // Set video codec for compression
          .audioCodec('aac') // Set audio codec
          .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
          })
          .on('end', () => {
            outputStream.end();
          });

        // Collect the optimized video in a buffer
        const chunks: Uint8Array[] = [];
        outputStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        outputStream.on('end', () => {
          compressedBuffer = Buffer.concat(chunks);
        });

        // Pipe the output of FFmpeg to the writable stream
        command.pipe(outputStream, { end: true });
      }
    } catch (error) {
      // if something goes wrong, just continue with the original file
      console.error(error);
      console.log('Error compressing media file');
      next();
    }

    if (compressedBuffer) file.buffer = compressedBuffer;
    console.log(
      `After compressing ${Math.floor(
        Buffer.byteLength(file.buffer) / 1024
      )} KB`
    );
    next();
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

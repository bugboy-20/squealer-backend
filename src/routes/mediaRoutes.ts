import polka from 'polka';
import multer from 'multer';
import {
  uploadMedia,
  getMedia,
  compressMedia,
} from '../controllers/mediaController';
import { catchServerError } from '../utils/controllersUtils';
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, callback) {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Sono permessi solo file immagine e video'));
    }
  },
  limits: {
    files: 1, // For multipart forms, the max number of file fields
    fileSize: 1024 * 1024 * 50, // 50 MB
  },
});

const mediaRoutes: (app: polka.Polka) => void = (app) => {
  app
    .post(
      '/api/media/',
      catchServerError(upload.single('media'), 406),
      compressMedia,
      uploadMedia
    )
    .get('/api/media/:id', getMedia);
};

export default mediaRoutes;

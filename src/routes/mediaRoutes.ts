
import polka from "polka"
import multer from "multer";
import {uploadMedia, getMedia} from "../controllers/mediaController";
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, callback) {
      if(file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
          callback(null, true)
      }
      else {
          callback(new Error('Only images and videos are allowed'))
      }
  },
  limits: {
    files: 1, // For multipart forms, the max number of file fields
    // fields: 0, // Max number of non-file fields
    // parts: 1, // For multipart forms, the max number of parts (fields + files)
  },
});

const mediaRoutes : (app : polka.Polka) => void = app => {
    app
      .post('/api/media/', upload.single('media'), uploadMedia)
      .get('/api/media/:id?', getMedia)
}

export default mediaRoutes;


import polka from "polka"
import multer from "multer";
import {uploadMedia, getMedia} from "../controllers/mediaController";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fields: 0, // Max number of non-file fields
    files: 1, // For multipart forms, the max number of file fields
    parts: 1, // For multipart forms, the max number of parts (fields + files)
  },
});

const mediaRoutes : (app : polka.Polka) => void = app => {
    app
      .post('/api/media', upload.single('media'), uploadMedia)
      .get('/api/media/:id?', getMedia)
}

export default mediaRoutes;

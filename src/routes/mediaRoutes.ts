
import polka from "polka"
import multer from "multer";
import {uploadMedia, getMedia} from "../controllers/mediaController";
const upload = multer();

const logRoutes : (app : polka.Polka) => void = app => {
    app
      .post('/api/media', upload.single('media'), uploadMedia)
      .get('/api/media/:id?', getMedia)
}

export default logRoutes;

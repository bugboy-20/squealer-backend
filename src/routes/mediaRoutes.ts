
import polka from "polka"
import multer from "multer";
import {uploadMedia} from "../controllers/mediaController";
const upload = multer();

const logRoutes : (app : polka.Polka) => void = app => {
    app
      .post('/api/media', upload.single('media'), uploadMedia)
}

export default logRoutes;

import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env`})

import express from 'express'
import bodyParser from "body-parser";
import {db_open} from "./db_utils";
import routes from "./routes/routes";
import cors from "cors"
import schedules from './schedules/schedules';
import { credentials } from './middleware/credentials';
import { corsOptions } from './utils/corsOptions';
import path from 'path';
import compression from "compression"

const app = express()
const basePath = path.join(__dirname, '../')

console.log(process.env)
console.log(new Date(Date.now()))
app
  .use(credentials) // BEFORE CORS
  .use(cors(corsOptions))
  .use('/',express.static(path.join(basePath, 'app')))
  .use('/smm',express.static(path.join(basePath, 'smm')))
  .use("/moderator", express.static(path.join(basePath, 'mod')))
  .use('/marker-icon.png', express.static(path.join(basePath, 'backend', 'marker-icon.png')))
  .use('/marker-shadow.png', express.static(path.join(basePath, 'backend', 'marker-shadow.png')))
  .use('/**/marker-icon.png', express.static(path.join(basePath, 'backend', 'marker-icon.png')))
  .use('/**/marker-shadow.png', express.static(path.join(basePath, 'backend', 'marker-shadow.png')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(compression())

db_open()
schedules()

app
  .get('/api/redirect', (_,res) => {
    res.redirect('users')
  })

routes(app)

app.get('/smm/*', (_, res) => {
  res.sendFile(path.join(basePath, 'smm/index.html'));
});

app.get('*', (_, res) => {
  res.sendFile(path.join(basePath, 'app/index.html'));
});


app
  .listen(8000)

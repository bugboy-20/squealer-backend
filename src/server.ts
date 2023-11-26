//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial

/* TODO List
 *
 *  sistemare user model
 *
 *  come gestire gli squeal con immagini?
 *  
 *  
 *  scheduling 
 *
 *  valutare Zod e autogenerazione della API doc
 */
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env`})

import express from 'express'
import bodyParser from "body-parser";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";
import cors from "cors"
import schedules from './schedules/schedules';
import { credentials } from './middleware/credentials';
import { corsOptions } from './utils/corsOptions';
import path from 'path';

/*
const app = polka({
                 onNoMatch: send404,
                 onError : (err, req, res, next) => { res.statusCode= 500; res.end(err.message) }
})*/

const app = express()
const basePath = path.join(__dirname, '../')

console.log(process.env)
console.log(new Date(Date.now()))
app
  //.use(addJsonFn)
  //.use(addCookieFn)
  //.use(addClearCookieFn)
  .use(credentials) // BEFORE CORS
  .use(cors(corsOptions))
  .use('/',express.static(path.join(basePath, 'app')))
  .use('/smm',express.static(path.join(basePath, 'smm')))
  .use("/moderator", express.static(path.join(basePath, 'mod')))
  //.use(parseJWT)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

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

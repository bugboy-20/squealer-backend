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

const serve_app = require('sirv')(__dirname + '/../app');
const serve_smm = require('sirv')(__dirname + '/../smm');
//const serve_mod = require('sirv')(__dirname + '/../smm');
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env`})

import express from 'express'
import bodyParser from "body-parser";
import polka from "polka";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";
import cors from "cors"
import {send404, send501} from "./utils/statusSenders";
import schedules from './schedules/schedules';
import { credentials } from './middleware/credentials';
import { corsOptions } from './utils/corsOptions';
import {parseJWT} from './middleware/verifyJWT';
import {addClearCookieFn, addCookieFn, addJsonFn} from './middleware/resMiddleware';

/*
const app = polka({
                 onNoMatch: send404,
                 onError : (err, req, res, next) => { res.statusCode= 500; res.end(err.message) }
})*/

const app = express()

console.log(process.env)
console.log(new Date(Date.now()))
app
  //.use(addJsonFn)
  //.use(addCookieFn)
  //.use(addClearCookieFn)
  .use(credentials) // BEFORE CORS
  .use(cors(corsOptions))
  //.use(parseJWT)
  .use(serve_app)
  //.use('/smm',serve_smm, {index: ['index.html']})
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

db_open()
schedules()

app
  .get('/api/redirect', (_,res) => {
    res.redirect('users')
  })

routes(app)

app
  .listen(8000)

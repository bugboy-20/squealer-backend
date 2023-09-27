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

import bodyParser from "body-parser";
import polka from "polka";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";
import cors from "cors"
import {send404, send501} from "./utils/statusSenders";
import {verifyToken} from './utils/authorisation';
import schedules from './schedules/schedules';
import { credentials } from './middleware/credentials';
import { corsOptions } from './utils/corsOptions';
import {auth} from './middleware/auth';
import {parseJWT} from './middleware/verifyJWT';
import {addJsonFn} from './middleware/resMiddleware';

const app = polka({
                 onNoMatch: send404,
                 onError : (err, req, res, next) => { res.statusCode= 500; res.end(err.message) }
})

console.log(process.env)
console.log(new Date(Date.now()))
app
  .use(addJsonFn)
  .use(credentials) // BEFORE CORS
  .use(cors(corsOptions))
  //.use(verifyToken)
  .use(serve_app)
  .use('/smm',serve_smm, {index: ['index.html']})
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(parseJWT)

routes(app)
db_open()
schedules()

app
  .get('/api/help', (_, res) => res.end('Hello World!'))


  .get('/api/auth/token', (_) => send501)

  .get('/api/jsonTest', (_,res) => { //TODO eseguire codesta
    res.json({ status: "success!"})
  })
  .listen(8000, (err : Error) => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

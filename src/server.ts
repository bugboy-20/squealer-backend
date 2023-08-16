//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial

/* TODO List
 *
 *  come gestire gli squeal con immagini?
 *  
 *  sistemare id e creazione di squeals
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

const app = polka({
                 onNoMatch: send404,
                 onError : (err, req, res, next) => { res.end(err.message) }
})

console.log(process.env)
console.log(__dirname)

app
  .use(cors())
  //.use(verifyToken)
  .use(serve_app)
  .use('/smm',serve_smm, {index: ['index.html']})
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))

routes(app)
db_open()

app
  .get('/api/help', (_, res) => res.end('Hello World!'))
  .get('/tokentest', verifyToken, (req,res) => { res.end('Benvenuto nel mio onlyfans')} )

  .get('/api/auth/token', (_) => send501)

  .listen(8000, (err : Error) => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

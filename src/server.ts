//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial

/* TODO List
 *  username univoco
 *  token
 */

const serve_app = require('sirv')(__dirname + '/../app');
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
  .use(verifyToken)
  .use(serve_app)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))

routes(app)
db_open()

app
  .get('/api/help', (_, res) => res.end('Hello World!'))

  .get('/api/auth/token', (_) => send501)

  .listen(8000, (err : Error) => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

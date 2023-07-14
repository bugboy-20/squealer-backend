//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial

/* TODO List
 *  username univoco
 *  get singolo user
 *  token
 */

const serve_app = require('sirv')(__dirname + '/../app');
import 'dotenv/config'
import bodyParser from "body-parser";
import polka from "polka";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";
import cors from "cors"
import {send404, send501} from "./utils/statusSenders";

const app = polka({
                 onNoMatch: send404,
                 onError : (err, req, res, next) => { res.end('err') }
})

console.log(process.env)

app
  .use(cors())
  .use(serve_app)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))

routes(app)
db_open()

app
  .get('/api/help', (req, res) => res.end('Hello World!'))

  .get('/api/auth/token', (req, res) => send501)

  .listen(8000, (err : Error) => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

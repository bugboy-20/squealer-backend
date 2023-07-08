//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial

/* TODO List
 *  token
 */

const serve_app = require('sirv')(__dirname + '/../app');
import bodyParser from "body-parser";
import polka from "polka";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";
import cors from "cors"

const handle404 = (req, res) => {
  res.statusCode = 404;
  res.end('404 - Page not found');
}

const app = polka({
                 onNoMatch: handle404,
                 onError : (err, req, res, next) => { res.end('err') }
})

app
  .use(cors())
  .use(serve_app)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))

routes(app)
db_open()

app
  .get('/api/help', (req, res) => res.end('Hello World!'))

  .get('/api/auth/token', (req, res) => res.end('SEX'))

  .listen(8000, (err : Error) => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

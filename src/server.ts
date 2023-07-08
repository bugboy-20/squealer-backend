//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial


const serve_app = require('sirv')(__dirname + '/../app');
import bodyParser from "body-parser";
import polka from "polka";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";
import cors from "cors"

//TODO add cors

const app = polka()
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
  .get('', (req,res) => {res})


  .listen(8000, (err : Error) => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

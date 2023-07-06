//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial


const serve_app = require('sirv')(__dirname + '/../app');
import polka from "polka";
import {db_open} from "./db_utils";
//const polka = require('polka');
import routes from "./routes/routes";

const app = polka()
app
  .use(serve_app)

routes(app)
db_open()

app
  .get('/api/help', (req, res) => res.end('Hello World!'))

  .get('/api/auth/token', (req, res) => res.end('SEX'))


  .listen(8000, err => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

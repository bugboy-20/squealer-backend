//https://renedellefont.com/writing/introduction-to-polka/
//https://codesource.io/create-a-crud-application-using-vue-node-and-mongodb/ <- referecne tuttorial
import * as polka from "polka" 

polka()
  .get('/', (req, res) => res.end('Hello World!'))
  .listen(8000, err => {
    if (err) throw err
    console.log(`> Running on localhost:8000`)
  })

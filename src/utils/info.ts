
import polka from "polka"

const serverInfo : (app : polka.Polka) => void = app => {
    app
      .get('/api/info', (req,res) =>{
        let infos = {
          appName: "Squealer",
          defaultCharsPerDay: 50, //TODO metterli nel .env
          defaultCharsPerWeek: 250,
          defaultCharsPerMonth: 750
        }

        res
          .writeHead(200, {'Content-Type': 'application/json'})
          .end(JSON.stringify(infos))
      })
}

export default serverInfo;

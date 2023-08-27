
import polka from "polka"

const serverInfo : (app : polka.Polka) => void = app => {
    app
      .get('/api/info', (req,res) =>{
        let infos = {
          appName: "Squealer",
          defaultCharsPerDay: +(process.env.CHAR_PER_DAY as string),
          defaultCharsPerWeek: +(process.env.CHAR_PER_WEEK as string),
          defaultCharsPerMonth: +(process.env.CHAR_PER_MONTH as string)
        }

        res
          .writeHead(200, {'Content-Type': 'application/json'})
          .end(JSON.stringify(infos))
      })
}

export default serverInfo;

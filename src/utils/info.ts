
import { Express } from 'express'

const serverInfo : (app : Express) => Express = app =>
    app
      .get('/api/info', (req,res) =>{
        let infos = {
          appName: "Squealer",
          defaultCharsPerDay: +(process.env.CHAR_PER_DAY as string),
          defaultCharsPerWeek: +(process.env.CHAR_PER_WEEK as string),
          defaultCharsPerMonth: +(process.env.CHAR_PER_MONTH as string)
        }

        res.json(infos);
      })

export default serverInfo;

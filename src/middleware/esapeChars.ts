import {RequestHandler} from "express"

const escapeChars = (str: string) => {
  return str.replace(/%C2%A7/ig, '§').replace(/%23/ig, '#').replace(/%40/ig, '@')
}

const escapeParam = (param: string) => {
    const fn : RequestHandler = (req,_,next) => {
        if(req.params[param])
          req.params[param] = escapeChars(req.params[param])
        next()
    }

    return fn
}

const escapeQuery = (param: string) => {
    const fn : RequestHandler = (req,_,next) => {
        if (req.query[param]) {
          let newQuery = req.query[param];

          if (typeof newQuery === 'string')
            newQuery = escapeChars(newQuery)

          req.query[param] = newQuery;
        }
        next()
    }

    return fn
}


export { escapeParam, escapeQuery }

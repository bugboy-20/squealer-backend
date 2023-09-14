import {RequestHandler} from "express"

const escapeParam = (param: string) => {
    const fn : RequestHandler = (req,res,next) => {
        if(req.params[param])
          req.params[param] = req.params[param].replace(/%C2%A7/i, '§') // '§' issue
        next()
    }

    return fn
}

const escapeQuery = (param: string) => {
    const fn : RequestHandler = (req,res,next) => {
        if (req.query[param]) {
          let newQuery = req.query[param];

          if (typeof newQuery === 'string')
            newQuery = newQuery.replace(/%C2%A7/i, '§'); // '§' issue

          req.query[param] = newQuery;
        }
        next()
    }

    return fn
}


export { escapeParam, escapeQuery }

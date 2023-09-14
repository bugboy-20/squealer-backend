import {RequestHandler} from "express"

const escapeParam = (param: string) => {
    const fn : RequestHandler = (req,res,next) => {
        req.params[param] = req.params[param].replace(/%C2%A7/i, '§') // '§' issue
        next()
    }

    return fn
}

export { escapeParam }

import {RequestHandler} from "express";

const catchServerError = function (f: RequestHandler, errorCode = 500, errorMessage?: string, responce?: (() => void) | undefined) : RequestHandler {
  let r : RequestHandler = async (req, res, next) => {
    try {
      f(req,res,next)
    } catch(e) {
      if (errorMessage)
        console.error(errorMessage)
      else
        console.error('Error ' + errorMessage + ':')

      console.error(e)
      res.statusCode = errorCode
      res.end(responce)
    }
  }

  return r
}


export { catchServerError }

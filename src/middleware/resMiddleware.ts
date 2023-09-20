import { Middleware } from 'polka'

const addJsonFn : Middleware = (req,res,next) => {
  (res as any).json = (body : any) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }

  next()
}


export { addJsonFn }

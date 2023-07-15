import {RequestHandler} from "sirv";

const send404 : RequestHandler = (req, res) => {
  res.statusCode = 404;
  res.end('404 - Page not found');
}

const send501 : RequestHandler = (req, res) => {
  res.statusCode = 501;
  res.end('501 - Not implemented');
}

export {send404, send501};

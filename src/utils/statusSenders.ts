import {RequestHandler} from "sirv";

const send404 : RequestHandler = (req, res) => {
  res.statusCode = 404;
  res.end('404 - Page not found');
}

const send501 : RequestHandler = (req, res) => {
  res.statusCode = 501;
  res.end('501 - Not implemented');
}

const send401 : RequestHandler = (req, res) => {
  res.statusCode = 401;
  res.end('401 - Unauthorized');
}

const send403 : RequestHandler = (req, res) => {
  res.statusCode = 403;
  res.end('403 - Forbidden');
}

const send204 : RequestHandler = (req, res) => {
  res.statusCode = 204;
  res.end('204 - No Content');
}

export {send204, send404, send501, send401, send403};

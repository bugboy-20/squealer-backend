import { RequestHandler } from 'express';

const send404: RequestHandler = (req, res) => {
  res.sendStatus(404);
};

const send501: RequestHandler = (req, res) => {
  res.sendStatus(501);
};

const send401: RequestHandler = (req, res) => {
  res.sendStatus(401);
};

const send403: RequestHandler = (req, res) => {
  res.sendStatus(403);
};

const send204: RequestHandler = (req, res) => {
  res.sendStatus(204);
};

export { send204, send404, send501, send401, send403 };

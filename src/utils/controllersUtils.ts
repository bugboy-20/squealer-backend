import {RequestHandler, Response} from "express";
// Reference: https://stackoverflow.com/questions/61086833/async-await-in-express-middleware

type AsyncRequestHandler = RequestHandler extends (...a: infer A) => any
  ? (...a: A) => Promise<any>
  : never;

const handleError = (res: Response, error: unknown, errorCode = 500, errorMessage?: string) => {
  const eMessagge = error instanceof Error ? error.message : String(error);
  const message = errorMessage ?? eMessagge ?? 'Internal Server Error';
  console.error(eMessagge);
  console.error(message);
  res.status(errorCode).json({ message });
}

const catchServerError = function (f: AsyncRequestHandler, errorCode = 500, errorMessage?: string): RequestHandler {
  return (req, res, next) => {
    // try for normal errors and .catch for promise rejections
    try {
      f(req, res, next).catch((e: Error) => {
        handleError(res, e, errorCode, errorMessage);
      });
    } catch (e) {
      handleError(res, e, errorCode, errorMessage);
    }
  };
};

export { catchServerError }

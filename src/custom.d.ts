declare namespace Express {
  export interface Request {
    auth:
      | { isAuth: false; username: ""; usertype: "" }
      | { isAuth: true; username: string; usertype: string };
  }
}

declare module "mongoose" {
  interface SaveOptions {
    disableMiddleware?: boolean;
  }
}
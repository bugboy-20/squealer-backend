import { Middleware } from 'polka';
import cookie from 'cookie';

const addJsonFn: Middleware = (req, res, next) => {
  (res as any).json = (body: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };

  next();
};

const addCookieFn: Middleware = (req, res, next) => {
  (res as any).cookie = (
    name: string,
    value: string,
    options?: cookie.CookieSerializeOptions | undefined
  ) => {
    const opts = { ...options };

    const val =
      typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

    if (opts.maxAge != null) {
      const maxAge = opts.maxAge - 0;

      if (!isNaN(maxAge)) {
        opts.expires = new Date(Date.now() + maxAge);
        opts.maxAge = Math.floor(maxAge / 1000);
      }
    }

    if (opts.path == null) {
      opts.path = '/';
    }

    const prevHeader = res.getHeader('Set-Cookie');
    const newHeader = cookie.serialize(name, String(val), opts);
    // header shenanigans
    const cookieHeader =
      prevHeader instanceof Array
        ? [...prevHeader, newHeader]
        : typeof prevHeader === 'string'
        ? [prevHeader, newHeader]
        : newHeader;
    res.setHeader('Set-Cookie', cookieHeader);
  };

  next();
};

const addClearCookieFn: Middleware = (req, res, next) => {
  res.clearCookie = function clearCookie(name, options) {
    const opts = { expires: new Date(1), path: '/', ...options };

    return this.cookie(name, '', opts);
  };
  next();
};

export { addJsonFn, addCookieFn, addClearCookieFn };

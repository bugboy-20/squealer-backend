
const send404 = (req, res) => {
  res.statusCode = 404;
  res.end('404 - Page not found');
}

const send501 = (req, res) => {
  res.statusCode = 501;
  res.end();
}

export {send404, send501};

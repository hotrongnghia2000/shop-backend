// handleError is used to catch err and exception that next passes down
// handleError will be placed at the end of the server.js file to ensure it is not missed
// express requires 4 params to get err
module.exports = (err, req, res, next) => {
  // format err info
  const errInfo = {
    statuss: 'ERROR',
    message: err.message,
  };

  const httpCode = err.httpCode || 500;

  // log some information to make it easier to check err
  console.log('\nERROR');
  console.log('Date: ' + new Date().toLocaleString());
  console.log('Request:', req.method, req.originalUrl, httpCode);
  console.log('Params:', req.params);
  ('');
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Error message: ', err.message);
  // console.log('Error stack: ', err.stack);
  console.log('END ERROR (^_^)\n ');

  // results returned to the client
  return res.status(httpCode).json(errInfo);
};

// handleError dùng để bắt err và exception mà next chuyển xuống
// handleError sẽ đặt ở cuối file server.js để đảm bảo không bỏ lỡ
// express yêu cầu 4 params để lấy được err
module.exports = (err, req, res, next) => {
  // format err info
  const errInfo = {
    statuss: 'ERROR',
    message: err.message,
  };

  const httpCode = err.httpCode || 500;

  // log một số thông tin cho dễ check err
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

  // kết quả trả về phía client
  return res.status(httpCode).json(errInfo);
};

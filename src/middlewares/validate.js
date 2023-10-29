const { validationResult } = require('express-validator');
module.exports = (validator) => {
  return [
    ...validator(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: 'VALIDATE FAILED',
          err_fields: errors.mapped(),
        });
      }
      next();
    },
  ];
};

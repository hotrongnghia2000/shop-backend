const crypto = require('crypto');
module.exports = hashString = (string) => {
  return crypto.createHash('sha256').update(string).digest('hex');
};

const nodemailer = require('nodemailer');

module.exports = sendMail = async ({ email, html, subject }) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SERVER_EMAIL, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"SHIPO_SHOP" <no-relply@shipo.com>', // sender address
    to: email, // list of receivers
    subject, // Subject line
    html, // html body
  });

  return info;
};

const nodemailer = require('nodemailer');
const mail = require('../keys/mail');
const debug = require('debug')('mail:');
var transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure:true,
    auth: mail
});

module.exports = (to,subject,html) => {
  mailOptions={
      from: mail.user,
      to: to,
      subject : subject,
      html : html
  };
  transporter.sendMail(mailOptions).then((res)=>{
    debug(res);
  }).catch((err)=>{
    debug(err);
  })
}

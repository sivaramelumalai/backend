require('dotenv').config()
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const mailer = () => {
    console.log("hello")
    const msg = {
        to: 'sivaramelumalai4032588@gmail.com',
        from: 'sivaramelumalai4032588@gmail.com',
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };
      sgMail.send(msg)
      console.log('done')

};

module.exports = mailer;


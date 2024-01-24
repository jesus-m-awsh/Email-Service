
const nodemailer = require('nodemailer');
const pug = require('pug');
const ejs = require('ejs');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(data) {
    console.log(`sending email to ${data.element}`);
    this.title = data.title
    this.subject = data.subject
    this.message = data.message
    this.host = data.host
    this.port = data.port
    this.email_user = data.email_user
    this.email_password = data.email_password
    this.to = data.element
  }

  newTransport() {
    console.log('new transport!');
    return nodemailer.createTransport({
      // host: 'smtp.gmail.com',
      host: this.host,
      port: this.port,

      // port: 465,
      secure: true,
      auth: {
        user: this.email_user,
        pass: this.email_password

          // user: 'studio73pty.noreply@gmail.com',
          // pass: 'pfiakggdypqridiq'
      },
      tls:{
          rejectUnauthorized: false
      }
    });
  }
  // Send the actual email
  async send() {
 
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/welcome.pug`, {
    // const html = ejs.renderFile(`${__dirname}/../views/email.ejs`, {

        subject: this.subject,
        title: this.title,
        message: this.message
      //   user_firstname: "http://www.8link.in/confirm=",
      // confirm_link: "http://www.8link.in/confirm=" 
      });
    
    // 2) Define email options
    const mailOptions = {
      from: "'Awsh' <test_web@awsh.live>",
      // to: "jdiaz.97ma@gmail.com",
      to: this.to,
      subject: this.subject,
      html: html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }



};

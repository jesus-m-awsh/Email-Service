import express from 'express';
import cors from 'cors';
import path from "path";
import email from './utils/email'
import multer from 'multer'
const morgan = require('morgan');
const fs = require('fs');
const csv = require('fast-csv');
const nodemailer = require('nodemailer');
 
const app = express();

app.set('view engine', 'pug');
// app.set('view engine', 'ejs');


app.set('views', path.join(__dirname, 'views'));


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('looking destination');
    cb(null, './assets');
  },
  filename: (req, file, cb) => {
    //user-id-timestamp.extension
    // const ext = file.mimetype.split('/')[1];
    const ext = file.originalname.split('.')[1];
    console.log('renaming file');
    // cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    cb(null, `parse.${ext}`);

  },
});


const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('text/csv')) {
    cb(null, true);
  } else {
    cb( console.log('Errorrrrrr!') , false);
  }
};



const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadServiceImages = upload.single('file');

app.post('/api/run-something-else',
  uploadServiceImages,
 (req,res,next) => {
    let targetEmails = [];
    fs.createReadStream(path.resolve(__dirname, './assets', 'parse.csv'))
    // .pipe(csv.parse({ headers: true }))
    .pipe(csv.parse())
    .on('error', error => console.error(error))
    .on('data', async (row) => {
      targetEmails.push(row[0])
      console.log(row[0])
    })
    .on('end', rowCount => {
      // targetEmails.forEach(function (item, index) {
      //   console.log(item);
      // });
      req.body.targetEmails = targetEmails;
      // console.log(`Parsed ${rowCount} rows`)
      next()
    });
  },
  (req,res) => {
    const {title, subject, message, useSmtp, host, port, email_user,email_password} = req.body

    console.log(req.body)
    if(useSmtp == 'true'){
            req.body.targetEmails.forEach((element,i) => {
              setTimeout(
                  async function(){
                    console.log(element);  
                    try {
                      await new email({
                        title,
                        subject,
                        message,
                        host,
                        port,
                        email_user,
                        email_password,
                        element
                      }).send()
                    } catch (error) {
                      console.log(error);
                    }
                  }
              , i * 5000);
      });
    }
 
    if(useSmtp == 'false'){
          req.body.targetEmails.forEach((element,i) => {
            setTimeout(
              async function(){
                console.log(element);  
                try {
                  const transporter = nodemailer.createTransport({
                    port: 25,
                    host: '172.17.0.4',
                    tls: {
                      rejectUnauthorized: false
                    },
                  });
                
                  var message = {
                    from: 'noreply@domain.com',
                    to: element,
                    subject: 'Confirm Email',
                    text: 'Please confirm your email',
                    html: '<p>Please confirm your email</p>'
                  };
                
                  transporter.sendMail(message, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                  });
                } catch (error) {
                  console.log(error);
                }
              }
          , i * 5000);
    });  
    }
  res.status(200).send('Done.');
  },
);


const port = process.env.PORT || 8001;

app.listen(port, () => console.log(`Server running on port ${port}`));


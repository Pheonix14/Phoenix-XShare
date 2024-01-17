import express from 'express';
import fileUpload from "express-fileupload";
import fs from 'fs';
import path from 'path';
import qrCode from 'qrcode';
import bcrypt from 'bcrypt';
import session from 'express-session';
import crypto from 'crypto';
import ejs from 'ejs';
import cookieParser from 'cookie-parser';
import { DateTime } from 'luxon';
import SQLiteStore from 'connect-sqlite3';
import log from './utils/console.js';
import getDB from './utils/quickdb.js';
import config from '../config/config.json' assert { type: "json" };

const app = express();

app.set('view engine', 'ejs');

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.use(express.json());


app.use(cookieParser()); // Use cookie-parser middleware

const SQLiteStoreInstance = SQLiteStore(session);

app.use(session({
  store: new SQLiteStoreInstance({
    db: 'sessionsDB.sqlite',
    table: 'sessions',
    dir: './src/utils/db/'
  }),
  secret: config.settings.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 15 * 24 * 60 * 60 * 1000 }
}));

// Use the URL-encoded body parser
app.use(express.urlencoded({ extended: true })); 

app.use(fileUpload());

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

app.get('/', checkLoggedIn, (req, res) => {
  res.render('login');
});

// Handle login form submission
app.get('/login', checkLoggedIn, (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const {username, password} = req.body;

  if (username !== config.settings.loginUser && password !== config.settings.loginPass) {
      return res.status(400).send('Invalid username or password');
  }

      res.cookie("loggedIn", true);
      res.cookie("loggedInUser", username);
      req.session.user = username;
      req.session.loggedIn = true;
  return res.redirect('/upload');
});

// Authentication middleware
function authenticate(req, res, next) {
  // Check if the user is logged in
  if (req.session.loggedIn) {
    next();
  } else {
    // Check if there is a loggedInUser cookie and restore the session
    if (req.cookies.loggedIn) {
      req.session.loggedIn = true;
      req.session.user = req.cookies.loggedInUser;
      req.session.loggedIn = true;
      return next();
    }
    // User is not logged in, redirect to the login page
    res.redirect('/');
  }
}

function checkLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    return res.redirect('/upload');
  }
  next();
}

// Serve the upload form page
app.get('/upload', authenticate, (req, res) => {
  res.render('upload');
});

// Handle file upload
app.post('/upload', authenticate, async (req, res) => {
  try { 
  const username = req.session.user;
  const db = await getDB();
  // Check if a file was uploaded
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file was uploaded.');
  }
const file = req.files.file;
  
  const fileExtension = path.extname(file.name);
  let fileN = file.name.split('.')[0];
  let fileN2;
  if (fileN.includes(' ')) {
  fileN2 = fileN.replace(/ /g, '');
  } else {
     fileN2 = fileN;
  }

const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const shortID = Array.from({ length: crypto.randomInt(5, 11) }, () => characters[crypto.randomInt(characters.length)]).join('');
    
  const fileName = `${fileN2}-${shortID}${fileExtension}`;
  const filePath = path.join(__dirname, 'uploads', fileName);

  const downloadLink = `${config.settings.domain}/download/${fileName}`;
const qrdownloadLink = `${config.settings.domain}/download-file/${fileName}`;

// Get the current date and time in the local timezone
const localDateTime = DateTime.local();

// Convert to IST (Indian Standard Time)
const istDateTime = localDateTime.setZone('Asia/Kolkata');

// Format the output
const formattedOutput = `
Date: ${istDateTime.toLocaleString(DateTime.DATE_FULL)} Time: ${istDateTime.toLocaleString(DateTime.TIME_24_SIMPLE)} IST (GMT+05:30)`;
// Generate the QR code image
  const qrCodeImage = await qrCode.toDataURL(qrdownloadLink);
    
  if (config.settings.encryption) {
     const encryptedFilePath = encryptFile(file.data, filePath);
  } else {
    fs.writeFileSync(filePath, file.data);
  }
    fs.stat(filePath, async (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

    const filesDB = db.table('filesDB');
    
  await filesDB.set(fileName, {uploadTime: formattedOutput, uploader: username, encryption: `${config.settings.encryption}`, fileSize: fileSizeInMegabytes.toFixed(fileSizeInMegabytes < 1 ? 2 : 0)});
});
  // Display the file name, download link, and QR code on the upload success page
  res.send(`
<div class="Download">
    <h2>File uploaded successfully!</h2>
    <p>File name: ${fileName}</p>
    <p>Uploaded By: ${username}</p>
    <p>Upload Time: ${formattedOutput}</p>
    <div class="download-link-container">
    <button id="copyButton" class="btn btn-warning btn-sm" data-download-link=${downloadLink} onclick="copyToClipboard(this)">Copy Download Link</button>
</div>

    <img src="${qrCodeImage}" alt="QR Code">
</div>

<style>
    .Download {
        text-align: center;
        padding: 20px;
        background-color: #1e1e1e;
        border-radius: 10px;
        box-shadow: 0px 0px 20px rgba(255, 255, 255, 0.1);
        color: #fff;
    }

    h2 {
        font-size: 24px;
        margin-bottom: 20px;
        color: #fec107;
    }

    p {
        font-size: 16px;
        margin-bottom: 10px;
        color: #6bffc6;
    }

    .download-link-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    img {
        padding: 5px;
        width: 120px;
    }
</style>
`);
} catch (err) {
    log(err, 'error');
    res.status(500).send('File upload failed.');
  }
});


// Handle file download
app.get(`/download/:fileName`, async (req, res) => {
  
const { fileName } = req.params;
  const db = await getDB();

const filePath = path.join(__dirname, 'uploads', fileName);
  
  let foundFile;

fs.access(filePath, fs.constants.F_OK, async (err) => {
  if (!err) {
    foundFile = true;
  } else {
    foundFile = false;
  }
  if (!foundFile) {
    return res.status(404).render('error', { errorMessage: 'File not found' });
  }

  //getting fileData from db
  const filesDB = db.table('filesDB');
  let fileData = await filesDB.get(fileName);
  const uploadTime = fileData.uploadTime;
  const uploader = fileData.uploader;
  const fileSize = fileData.fileSize;
  
  res.render('download', { fileName, uploadTime, uploader, fileSize});
});
});

app.get(`/download-file/:fileName`, async (req, res) => {
  const { fileName } = req.params;
  const db = await getDB();

  const filePath = path.join(__dirname, 'uploads', fileName);

  fs.access(filePath, fs.constants.F_OK, async (err) => {
    if (err) {
      return res.status(404).render('error', { errorMessage: 'File not found' });
    }

    const filesDB = db.table('filesDB');
      let fileData = await filesDB.get(fileName);
      console.log(fileData.encryption);
      let downloableFile;

      if (fileData.encryption === 'true') {
        downloableFile = decryptFile(filePath);
      } else {
        downloableFile = filePath;
      }

      res.set({
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Transfer-Encoding': 'chunked',
        'Expires': 0,
        'Cache-Control': 'no-cache'
      });

      // Send the file for download
      res.download(downloableFile, async (err) => {
        if (err) {
          log(err, 'error');
          return res.status(500).send('Error occurred while downloading the file.');
        }
      if (fileData.encryption === 'true') {
            log(`Decrypted ${fileName} is now deleting because it's downloaded.....`);
    deleteFile(downloableFile)
      }
   });
  });
}); 

app.use((req, res, next) => {
  res.status(404).render('error', { errorMessage: 'Page not found' });
});

// file delete handler
function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      log(err, 'error');
    } else {
      log('File is deleted successfully.');
    }
  });
}

// Encryption function
function encryptFile(fileData, filePath) {
  const key = crypto.createHash('sha256').update(path.basename(filePath)).digest('hex').slice(0, 32);
  const iv = crypto.createHash('sha256').update(path.basename(filePath)).digest('hex').slice(0, 16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  const encryptedData = Buffer.concat([
    cipher.update(fileData),
    cipher.final()
  ]);

  fs.writeFileSync(filePath, encryptedData);

  return filePath;
}

function decryptFile(filePath) {
  const encryptedData = fs.readFileSync(filePath);

  const key = crypto.createHash('sha256').update(path.basename(filePath)).digest('hex').slice(0, 32);
  const iv = crypto.createHash('sha256').update(path.basename(filePath)).digest('hex').slice(0, 16);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  const decryptedData = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  const decryptedFilePath = filePath.replace('/uploads/', '/decrypted/');
  fs.writeFileSync(decryptedFilePath, decryptedData);

  return decryptedFilePath;
}

app.listen(config.settings.port, () => {
    log(`Phoenix XShare is running on port ${config.settings.port}`);
})
import express from "express";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";
import qrCode from "qrcode";
import session from "express-session";
import MongoStore from "connect-mongo";
import crypto from "crypto";
import ejs from "ejs";
import cookieParser from "cookie-parser";
import { DateTime } from "luxon";
import { createServer } from "http";
import log from "./utils/console.js";
import getDB from "./utils/mongodb.js";
import config from "../config/config.json" assert { type: "json" };

const app = express();
const server = createServer(app);

app.set("view engine", "ejs");

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.use(express.json());

app.use(cookieParser()); // Use cookie-parser middleware

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.settings.mongoURI,
      dbName: "phoenix-xshare",
      ttl: 14 * 24 * 60 * 60,
    }),
    secret: await generateRandomSecret(),
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 14 * 24 * 60 * 60, secure: config.settings.https }, // Set to true for HTTPS only
  }),
);

// Use the URL-encoded body parser
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload());

app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

app.get("/", checkLoggedIn, (req, res) => {
  res.render("login");
});

// Handle login form submission
app.get("/login", checkLoggedIn, (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    username !== config.settings.loginUser &&
    password !== config.settings.loginPass
  ) {
    return res.status(400).send("Invalid username or password");
  }

  res.cookie("loggedIn", true);
  res.cookie("loggedInUser", username);
  req.session.user = username;
  req.session.loggedIn = true;
  return res.redirect("/upload");
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
    res.redirect("/");
  }
}

function checkLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    return res.redirect("/upload");
  }
  next();
}

// Serve the upload form page
app.get("/upload", authenticate, (req, res) => {
  res.render("upload");
});

// Handle file upload
app.post("/upload", authenticate, async (req, res) => {
  try {
    const username = req.session.user;
    const db = await getDB();
    // Check if a file was uploaded
    if (!req.files || !req.files.file) {
      return res
        .status(400)
        .render("error", { errorMessage: "No file was uploaded." });
    }
    const file = req.files.file;

    const fileExtension = path.extname(file.name);
    let fileN = file.name.split(".")[0];
    let fileN2;
    if (fileN.includes(" ")) {
      fileN2 = fileN.replace(/ /g, "");
    } else {
      fileN2 = fileN;
    }

    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const shortID = Array.from(
      { length: crypto.randomInt(5, 11) },
      () => characters[crypto.randomInt(characters.length)],
    ).join("");

    const fileName = `${fileN2}-${shortID}${fileExtension}`;
    const filePath = path.join(__dirname, "uploads", fileName);

    const downloadLink = `${config.settings.domain}/download/${fileName}`;
    const qrdownloadLink = `${config.settings.domain}/api/${fileName}`;
    const cdnLink = `${config.settings.domain}/cdn/${fileName}`;
    // Get the current date and time in the local timezone
    const localDateTime = DateTime.local();

    // Format the output
    const formattedOutput = `
Date: ${localDateTime.toLocaleString(
      DateTime.DATE_FULL,
    )} Time: ${localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
    // Generate the QR code image
    const qrCodeImage = await qrCode.toDataURL(qrdownloadLink);

    if (config.settings.encryption) {
      const encryptedFilePath = await encryptFile(file.data, filePath);
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

      const dataCollection = db.collection("File_Data");

      await dataCollection.insertOne({
        uploadTime: formattedOutput,
        fileName: fileName,
        uploader: username,
        encryption: `${config.settings.encryption}`,
        fileSize: fileSizeInMegabytes.toFixed(fileSizeInMegabytes < 1 ? 2 : 0),
      });
    });
    // Display the file name, download link, and QR code on the upload success page
    res.render("uploaded", {
      fileName,
      downloadLink,
      cdnLink,
      qrCodeImage,
      uploader: username,
      uploadTime: formattedOutput,
    });
  } catch (err) {
    log(err, "error");
    return res
      .status(500)
      .render("error", { errorMessage: "File upload failed." });
  }
});

app.post("/webshare", authenticate, async (req, res) => {
  try {
    const username = req.session.user;
    const db = await getDB();
    // Check if a file was uploaded

    if (!req.files.mediaFiles) {
      return res
        .status(400)
        .render("error", { errorMessage: "No file was uploaded." });
    }
    if (Object.keys(req.files).length !== 1) {
      return res.status(400).render("error", {
        errorMessage: "Only one file can be uploaded at a time.",
      });
    }

    const file = req.files.mediaFiles;

    const fileExtension = path.extname(file.name);
    let fileN = file.name.split(".")[0];
    let fileN2;
    if (fileN.includes(" ")) {
      fileN2 = fileN.replace(/ /g, "");
    } else {
      fileN2 = fileN;
    }

    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const shortID = Array.from(
      { length: crypto.randomInt(5, 11) },
      () => characters[crypto.randomInt(characters.length)],
    ).join("");

    const fileName = `${fileN2}-${shortID}${fileExtension}`;
    const filePath = path.join(__dirname, "uploads", fileName);

    const downloadLink = `${config.settings.domain}/download/${fileName}`;
    const qrdownloadLink = `${config.settings.domain}/api/${fileName}`;
    const cdnLink = `${config.settings.domain}/cdn/${fileName}`;
    // Get the current date and time in the local timezone
    const localDateTime = DateTime.local();

    // Format the output
    const formattedOutput = `
Date: ${localDateTime.toLocaleString(
      DateTime.DATE_FULL,
    )} Time: ${localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
    // Generate the QR code image
    const qrCodeImage = await qrCode.toDataURL(qrdownloadLink);

    if (config.settings.encryption) {
      const encryptedFilePath = await encryptFile(file.data, filePath);
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

      const dataCollection = db.collection("File_Data");

      await dataCollection.insertOne({
        uploadTime: formattedOutput,
        uploader: username,
        fileName: fileName,
        encryption: `${config.settings.encryption}`,
        fileSize: fileSizeInMegabytes.toFixed(fileSizeInMegabytes < 1 ? 2 : 0),
      });
    });
    // Display the file name, download link, and QR code on the upload success page
    res.render("uploaded", {
      fileName,
      downloadLink,
      cdnLink,
      qrCodeImage,
      uploader: username,
      uploadTime: formattedOutput,
    });
  } catch (err) {
    log(err, "error");
    return res
      .status(500)
      .render("error", { errorMessage: "File upload failed." });
  }
});

// Handle file download
app.get(`/download/:fileName`, async (req, res) => {
  const { fileName } = req.params;
  const db = await getDB();

  const filePath = path.join(__dirname, "uploads", fileName);

  let foundFile;

  fs.access(filePath, fs.constants.F_OK, async (err) => {
    if (!err) {
      foundFile = true;
    } else {
      foundFile = false;
    }
    if (!foundFile) {
      return res
        .status(404)
        .render("error", { errorMessage: "File not found" });
    }

    //getting fileData from db
    const dataCollection = db.collection("File_Data");
    const fileData = await dataCollection.findOne({ fileName: fileName });
    const uploadTime = fileData.uploadTime;
    const uploader = fileData.uploader;
    const fileSize = fileData.fileSize;

    res.render("download", { fileName, uploadTime, uploader, fileSize });
  });
});

app.get(`/api/:fileName`, async (req, res) => {
  const { fileName } = req.params;
  const db = await getDB();

  const filePath = path.join(__dirname, "uploads", fileName);

  fs.access(filePath, fs.constants.F_OK, async (err) => {
    if (err) {
      return res
        .status(404)
        .render("error", { errorMessage: "File not found" });
    }

    const dataCollection = db.collection("File_Data");
    const fileData = await dataCollection.findOne({ fileName: fileName });

    let downloableFile;

    if (fileData.encryption === "true") {
      downloableFile = await decryptFile(filePath);
    } else {
      downloableFile = filePath;
    }

    res.set({
      "Accept-Ranges": "bytes",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Transfer-Encoding": "chunked",
      Expires: 0,
      "Cache-Control": "no-cache",
    });

    // Send the file for download
    res.download(downloableFile, async (err) => {
      if (err) {
        log(err, "error");
        return res.status(500).render("error", {
          errorMessage: "Error occurred while downloading the file.",
        });
      }
      if (fileData.encryption === "true") {
        deleteFile(downloableFile);
      }
    });
  });
});

app.get(`/cdn/:fileName`, async (req, res) => {
  const { fileName } = req.params;
  const apiLink = `${config.settings.domain}/api/${fileName}`;
  const cdnLink = `${config.settings.domain}/cdn/${fileName}`;

  const imageFileExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".tif",
    ".webp",
    ".svg",
    ".ico",
  ];
  const videoFileExtensions = [
    ".mp4",
    ".avi",
    ".mkv",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mpg",
    ".mpeg",
    ".m4v",
    ".3gp",
    ".ogg",
  ];

  if (imageFileExtensions.some((extension) => fileName.endsWith(extension))) {
    res.render("cdn", { fileName, apiLink, cdnLink });
  } else if (
    videoFileExtensions.some((extension) => fileName.endsWith(extension))
  ) {
    res.render("cdn-video", { fileName, apiLink, cdnLink });
  } else {
    res
      .status(500)
      .render("error", { errorMessage: "CDN doesn't suuport this file type." });
  }
});

app.use((req, res, next) => {
  res.status(404).render("error", { errorMessage: "Page not found" });
});

// file delete handler
function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      log(err, "error");
    }
  });
}

function generateRandomSecret() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });
}

// Encryption function
async function encryptFile(fileData, filePath) {
  const key = crypto.randomBytes(32); // Generate a random 32-byte key
  const iv = crypto.randomBytes(16); // Generate a random 16-byte IV

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  const encryptedData = Buffer.concat([
    cipher.update(fileData),
    cipher.final(),
  ]);

  fs.writeFileSync(filePath, encryptedData);

  // Store the key and IV in the database using the filePath as the key
  const db = await getDB();
  const dataCollection = db.collection("encryption_Data");

  await dataCollection.insertOne({
    filePath: filePath,
    key: key.toString("hex"),
    iv: iv.toString("hex"),
  });

  return filePath;
}

// Decryption function
async function decryptFile(filePath) {
  const encryptedData = fs.readFileSync(filePath);

  // Retrieve the key and IV from the database using the filePath as the key
  const db = await getDB();
  const dataCollection = db.collection("encryption_Data");
  const fileData = await dataCollection.findOne({ filePath: filePath });

  const keyHex = await fileData.key;
  const ivHex = await fileData.iv;

  if (!keyHex || !ivHex) {
    throw new Error("Key or IV not found in database");
  }

  const key = Buffer.from(keyHex, "hex");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  const decryptedData = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  const decryptedFilePath = filePath.replace("/uploads/", "/decrypted/");
  fs.writeFileSync(decryptedFilePath, decryptedData);

  return decryptedFilePath;
}

server.listen(config.settings.port, () => {
  log(`Phoenix XShare is running on port ${config.settings.port}`);
});

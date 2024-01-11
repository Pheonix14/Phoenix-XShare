![Logo](https://media.discordapp.net/attachments/1118813310041739314/1160459275932553236/20231008_113828_0000-removebg-preview.png)


# Phoenix Share

Share your files like never before with Phoenix Share. Phoenix Share is an open source file sharing platform that combines the simplicity of Express.js with the speed and security of a phoenix.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## Disclaimer

**IMPORTANT:** Although an encryption system has been added to this file sharing system, it is important to note that it may still have vulnerabilities and potential issues. Therefore, it is crucial to exercise caution when using this system and avoid uploading or sharing sensitive or confidential data. The files uploaded to the server are stored with encryption but things may break anytime. Please be aware that the security and reliability of the system cannot be guaranteed, and you should use it at your own risk.
## Features

- end-to-end encryption: a encryption system that provides more security.
- User authentication: Users can log in with their credentials to access the file sharing system.
- File upload: Users can select and upload files from their devices.
- File download: Uploaded files can be downloaded using unique download links.
- QR code generation: Quick sharing and scanning of files through QR codes.


## Prerequisites

Before running the system, ensure that you have the following installed:

- Node.js (lts Version)
- npm (Node Package Manager)
- SFTP server

## Run Locally

Clone the project:

```bash
  git clone https://github.com/Phoenix-Share/Phoenix-Share.git
```

Go to the project directory:

```bash
  cd Phoenix-Share
```

Config:

Rename the ./config/example-config.json to ./config/config.json And fill configurations.

Install dependencies:

```bash
  npm install
```

Start the server:

```bash
  npm run start
```


## Usage

1. Run `node index.js` or `npm start` to start the server.
2. Open your web browser and navigate to `http://localhost:3000`.
3. Log in with your credentials.
4. On the upload page, select the file you want to share and click the "Upload" button.
5. Once the upload is successful, you will be provided with a download link and a QR code for sharing.
6. Share the download link or QR code with others to allow them to download the file.


## Customization

- To change the server port, update the port number in `config.json` file.
- To change the domain, update the domain url in `config.json`.
- To change the cookie secret, update the secret key in `config.json`. 
## Support

For support, [Join discord server](https://discord.gg/DSdjz5Cgwb)


## License

[MIT License](LICENSE)

Feel free to customize and modify this file sharing system according to your needs. Contributions are welcome!

![Logo](https://media.discordapp.net/attachments/1152856250460160022/1195646381793222656/1704471806240.png)
# Phoenix XShare

Phoenix XShare is a private upload server of [Phoenix Share](https://github.com/Pheonix14/Phoenix-Share), a web application that allows users to upload and share files easily and securely. It is a fork of the Phoenix Share repository, with some additional features and improvements.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![GitHub Repo stars](https://img.shields.io/github/stars/Pheonix14/Phoenix-XShare)



## Key Features:

- Encryption toggle on/off option: Users can choose whether to encrypt their files before uploading them, for extra security and privacy.

- No external database and SFTP server needed: Phoenix XShare uses a local file system to store and manage files, eliminating the need for external dependencies and simplifying the setup process.

- Easy to use: Phoenix XShare has a user-friendly interface that makes uploading and sharing files a breeze.

- Almost every feature of Phoenix Share: Phoenix XShare inherits most of the features of Phoenix Share.

- New UI: Phoenix XShare has a new and improved user interface, with a modern and sleek design.

- Cross Platform: Phoenix XShare has better PWA(Progressive Web Apps) support than Phoenix Share.

- Lightweight And Efficient: Phoenix XShare more lighter than Phoenix Share and more efficient.

- More secure: Phoenix XShare has enhanced security measures, such as on-device encryption, database and storage.

## Prerequisites:

- Node.js (LTS version): You need to have Node.js installed on your system to run Phoenix XShare. You can download it from [here](https://nodejs.org/en ).
## Run locally:

To run Phoenix XShare locally, follow these steps:

Clone the repository: Run
```bash
git clone https://github.com/Phoenix-OPTE/Phoenix-XShare.git
```
 in your terminal to clone the Phoenix XShare repository to your local machine.

Change directory: Run
```bash
cd Phoenix-XShare
```
to change your current directory to the Phoenix XShare folder.

Install dependencies: Run
```bash
npm install
```
to install all the dependencies required for Phoenix XShare.

Fill the configuration: 
1. Rename the file example-config.json located in `/config/` to `config.json`.
2. Open the `/config/config.json` file.
3. Fill in the necessary configuration options, such as port, encryption toggle, domain, etc.

Start the server: Run 
```js
npm run start
```
to start the Phoenix XShare server. You should see a message like Phoenix XShare is running on `http://localhost:3000` in your browser.

Enjoy: Open your browser and go to `http://localhost:3000` to see Phoenix XShare in action. You can now upload and share files as you wish.

## License:

Phoenix XShare is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License. See the LICENSE file for more details.
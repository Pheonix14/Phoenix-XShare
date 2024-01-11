import SftpClient from 'ssh2-sftp-client';
import log from './console.js';
import config from './../../config/config.json' assert { type: "json" };

let client;

async function getClient() {
  if (!client) {
      try {
  client = new SftpClient();
await client.connect({
      host: config.sftpserver.host,
      port: 22, // SFTP typically uses port 22
      username: config.sftpserver.user,
      password: config.sftpserver.password,
      keepaliveInterval: 30000, 
      keepaliveCountMax: 3 
    });

    log('Connected to SFTP server');
      } catch (error) {
        log(error);
        throw error;
      }
  }
  return client;
}

export default getClient;
import { QuickDB } from 'quick.db';
import log from './console.js';
import config from './../../config/config.json' assert { type: "json" };

let quickDB;

async function getDB() {
  if (!quickDB) {
      try {
    quickDB = new QuickDB({
      filePath: "./src/utils/db/database.sqlite"
});
      } catch (error) {
        log(error);
        throw error;
      }
  }
  return quickDB;
}

export default getDB;
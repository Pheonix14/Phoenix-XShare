import { QuickDB } from "quick.db";
import log from './console.js';

let quickDB;

async function getDB() {
  if (!quickDB) {
      try {
    quickDB = new QuickDB({ filePath: "./src/database/database.sqlite" });
      } catch (error) {
        log(error);
        throw error;
      }
  }
  return quickDB;
}

export default getDB;
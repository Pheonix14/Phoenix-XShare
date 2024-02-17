import { QuickDB, JSONDriver } from "quick.db";
import log from './console.js';
import config from './../../config/config.json' assert { type: "json" };

let quickDB;

async function getDB() {
  if (!quickDB) {
      try {
        const jsonDriver = new JSONDriver();
    quickDB = new QuickDB({ driver: jsonDriver });
      } catch (error) {
        log(error);
        throw error;
      }
  }
  return quickDB;
}

export default getDB;
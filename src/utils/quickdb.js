import { QuickDB, JSONDriver } from "quick.db";
import log from './console.js';
const jsonDriver = new JSONDriver();

let quickDB;

async function getDB() {
  if (!quickDB) {
      try {
    quickDB = new QuickDB({ driver: jsonDriver });
      } catch (error) {
        log(error);
        throw error;
      }
  }
  return quickDB;
}

export default getDB;
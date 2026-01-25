const { MongoClient } = require('mongodb');

const DEFAULT_URI = 'mongodb://localhost:27017';
const DEFAULT_DB = 'fitlife';

let cachedClient;
let cachedDb;

async function getDb() {
  const uri = process.env.MONGO_URI || DEFAULT_URI;
  const dbName = process.env.MONGO_DB || DEFAULT_DB;

  if (cachedDb) return cachedDb;

  const client = cachedClient || new MongoClient(uri);
  if (!cachedClient) {
    await client.connect();
    cachedClient = client;
  }

  cachedDb = client.db(dbName);
  return cachedDb;
}

module.exports = { getDb };

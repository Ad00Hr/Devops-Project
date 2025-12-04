// api-node/src/db.js  (← give students THIS version)
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbPath = path.join(__dirname, '..', '..', 'dev.db');

async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

// Only returns current time – same shape as original Postgres version
const getDateTime = async () => {
  const db = await openDb();
  try {
    const row = await db.get("SELECT datetime('now') AS now");
    return { now: row.now };
  } finally {
    await db.close();
  }
};

module.exports = { getDateTime };
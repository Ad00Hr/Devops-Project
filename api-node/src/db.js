const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

async function openDb() {
  if (!db) {
    db = await open({
      filename: process.env.NODE_ENV === 'test'
        ? ':memory:'
        : './database.sqlite',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
  }
  return db;
}

module.exports = { openDb };

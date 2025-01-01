const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./crypto_army.db");

// Create table if it doesn't exist
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS pledges (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       message TEXT,
       wallet_address TEXT UNIQUE NOT NULL,
       signature TEXT NOT NULL,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

module.exports = db;

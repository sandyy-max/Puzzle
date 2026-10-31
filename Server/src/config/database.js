const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db;

function initDatabase(databasePath) {
  const dir = path.dirname(databasePath);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      score INTEGER NOT NULL DEFAULT 0,
      rounds_played INTEGER NOT NULL DEFAULT 0,
      rounds_correct INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS game_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      was_correct INTEGER NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      player_answer INTEGER,
      answered_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );
  `);

  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database has not been initialised');
  }
  return db;
}

module.exports = { initDatabase, getDb };

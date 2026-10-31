// User table access. All queries are parameterised.
const { getDb } = require('../config/database');

function createUser({ username, email, passwordHash }) {
  const result = getDb()
    .prepare(
      `INSERT INTO users (username, email, password_hash)
       VALUES (@username, @email, @passwordHash)`
    )
    .run({ username, email, passwordHash });

  return findById(result.lastInsertRowid);
}

function findById(id) {
  return getDb()
    .prepare(
      `SELECT id, username, email, created_at AS createdAt
       FROM users WHERE id = ?`
    )
    .get(id);
}

function findByUsername(username) {
  return getDb()
    .prepare(
      `SELECT id, username, email, password_hash AS passwordHash, created_at AS createdAt
       FROM users WHERE username = ? COLLATE NOCASE`
    )
    .get(username);
}

function findByEmail(email) {
  return getDb()
    .prepare(
      `SELECT id, username, email, password_hash AS passwordHash, created_at AS createdAt
       FROM users WHERE email = ? COLLATE NOCASE`
    )
    .get(email);
}

function getProfileStats(userId) {
  return getDb()
    .prepare(
      `SELECT
         COUNT(*) AS gamesPlayed,
         COALESCE(SUM(score), 0) AS totalScore,
         COALESCE(MAX(score), 0) AS bestScore,
         COALESCE(SUM(rounds_correct), 0) AS totalCorrect,
         COALESCE(SUM(rounds_played), 0) AS totalRounds
       FROM games
       WHERE user_id = ? AND finished_at IS NOT NULL`
    )
    .get(userId);
}

module.exports = {
  createUser,
  findById,
  findByUsername,
  findByEmail,
  getProfileStats,
};

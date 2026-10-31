// Games and rounds. Leaderboard only includes finished, named players.
const { getDb } = require('../config/database');

function startGame({ userId, difficulty }) {
  const result = getDb()
    .prepare(
      `INSERT INTO games (user_id, difficulty)
       VALUES (@userId, @difficulty)`
    )
    .run({ userId: userId || null, difficulty });

  return result.lastInsertRowid;
}

function recordRound({ gameId, wasCorrect, points, playerAnswer }) {
  getDb()
    .prepare(
      `INSERT INTO game_rounds (game_id, was_correct, points, player_answer)
       VALUES (@gameId, @wasCorrect, @points, @playerAnswer)`
    )
    .run({
      gameId,
      wasCorrect: wasCorrect ? 1 : 0,
      points,
      playerAnswer,
    });

  getDb()
    .prepare(
      `UPDATE games
       SET score = score + @points,
           rounds_played = rounds_played + 1,
           rounds_correct = rounds_correct + @correctInc
       WHERE id = @gameId`
    )
    .run({
      gameId,
      points,
      correctInc: wasCorrect ? 1 : 0,
    });
}

function finishGame(gameId) {
  getDb()
    .prepare(`UPDATE games SET finished_at = datetime('now') WHERE id = ?`)
    .run(gameId);
}

function getGame(gameId) {
  return getDb()
    .prepare(
      `SELECT id, user_id AS userId, difficulty, score,
              rounds_played AS roundsPlayed, rounds_correct AS roundsCorrect,
              started_at AS startedAt, finished_at AS finishedAt
       FROM games WHERE id = ?`
    )
    .get(gameId);
}

/** Top finished scores — only logged-in players. */
function getLeaderboard(limit = 10) {
  return getDb()
    .prepare(
      `SELECT g.score, g.difficulty, g.rounds_correct AS roundsCorrect,
              g.rounds_played AS roundsPlayed, g.finished_at AS finishedAt,
              u.username
       FROM games g
       INNER JOIN users u ON u.id = g.user_id
       WHERE g.finished_at IS NOT NULL
       ORDER BY g.score DESC, g.finished_at ASC
       LIMIT ?`
    )
    .all(limit);
}

function getHistoryForUser(userId, limit = 20) {
  return getDb()
    .prepare(
      `SELECT id, difficulty, score, rounds_played AS roundsPlayed,
              rounds_correct AS roundsCorrect, started_at AS startedAt,
              finished_at AS finishedAt
       FROM games
       WHERE user_id = ? AND finished_at IS NOT NULL
       ORDER BY finished_at DESC
       LIMIT ?`
    )
    .all(userId, limit);
}

module.exports = {
  startGame,
  recordRound,
  finishGame,
  getGame,
  getLeaderboard,
  getHistoryForUser,
};

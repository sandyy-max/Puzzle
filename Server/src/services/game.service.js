const { fetchPuzzle } = require('./bananaApi.service');
const gameModel = require('../models/game.model');
const { resolveDifficulty, getDifficultyConfig } = require('../utils/difficulty');

function createGameService(env) {
  function ensureRun(session) {
    if (!session.gameRun) {
      session.gameRun = {
        gameId: null,
        difficulty: 'medium',
        score: 0,
        played: 0,
        correct: 0,
      };
    }
    return session.gameRun;
  }

  function publicStats(run) {
    return {
      score: run.score || 0,
      played: run.played || 0,
      correct: run.correct || 0,
      difficulty: run.difficulty || 'medium',
      gameId: run.gameId || null,
    };
  }

  /** Opens a scored game row; links it to the player when they are logged in. */
  function beginGame(session, difficulty) {
    const level = resolveDifficulty(difficulty);
    session.gameRun = {
      gameId: gameModel.startGame({
        userId: session.userId || null,
        difficulty: level,
      }),
      difficulty: level,
      score: 0,
      played: 0,
      correct: 0,
    };
    session.currentPuzzle = null;
    return { ...session.gameRun, config: getDifficultyConfig(level) };
  }

  async function startRound(session) {
    const run = ensureRun(session);
    const config = getDifficultyConfig(run.difficulty);
    const puzzle = await fetchPuzzle(env.bananaApiUrl);

    // Solution stays on the server so the browser cannot cheat.
    session.currentPuzzle = {
      solution: puzzle.solution,
      issuedAt: Date.now(),
      timeLimitSec: config.timeLimitSec,
    };

    return {
      question: puzzle.question,
      issuedAt: session.currentPuzzle.issuedAt,
      timeLimitSec: config.timeLimitSec,
      difficulty: run.difficulty,
      stats: publicStats(run),
    };
  }

  function submitAnswer(session, rawAnswer, timedOut = false) {
    if (!session.currentPuzzle) {
      const error = new Error('No active puzzle. Start a new round first.');
      error.status = 400;
      throw error;
    }

    const run = ensureRun(session);
    const config = getDifficultyConfig(run.difficulty);
    const elapsedMs = Date.now() - session.currentPuzzle.issuedAt;
    const overTime = timedOut || elapsedMs > config.timeLimitSec * 1000 + 1500;

    let answer = null;
    if (!overTime) {
      answer = Number(rawAnswer);
      if (!Number.isInteger(answer)) {
        const error = new Error('Answer must be a whole number.');
        error.status = 400;
        throw error;
      }
    }

    const solution = session.currentPuzzle.solution;
    const correct = !overTime && answer === solution;
    const points = correct ? config.points : 0;

    session.currentPuzzle = null;
    run.played += 1;
    if (correct) {
      run.correct += 1;
      run.score += points;
    }

    if (run.gameId) {
      gameModel.recordRound({
        gameId: run.gameId,
        wasCorrect: correct,
        points,
        playerAnswer: overTime ? null : answer,
      });
    }

    return {
      correct,
      timedOut: overTime,
      solution,
      pointsAwarded: points,
      stats: publicStats(run),
      difficulty: run.difficulty,
      config,
    };
  }

  function endGame(session) {
    const run = ensureRun(session);
    if (run.gameId) gameModel.finishGame(run.gameId);

    const summary = {
      ...publicStats(run),
      difficulty: run.difficulty,
      gameId: run.gameId,
      savedToLeaderboard: Boolean(session.userId && run.gameId),
    };

    session.currentPuzzle = null;
    session.gameRun = null;
    return summary;
  }

  return {
    beginGame,
    startRound,
    submitAnswer,
    endGame,
    getStats: (session) => publicStats(ensureRun(session)),
    getLeaderboard: (limit) => gameModel.getLeaderboard(limit),
    getHistory: (userId, limit) => gameModel.getHistoryForUser(userId, limit),
  };
}

module.exports = { createGameService };

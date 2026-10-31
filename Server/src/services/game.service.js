const { fetchPuzzle } = require('./bananaApi.service');

function createGameService(env) {
  async function startRound(session) {
    const puzzle = await fetchPuzzle(env.bananaApiUrl);

    session.currentPuzzle = {
      solution: puzzle.solution,
      issuedAt: Date.now(),
    };

    return {
      question: puzzle.question,
      issuedAt: session.currentPuzzle.issuedAt,
    };
  }

  function submitAnswer(session, rawAnswer) {
    if (!session.currentPuzzle) {
      const error = new Error('No active puzzle. Start a new round first.');
      error.status = 400;
      throw error;
    }

    const answer = Number(rawAnswer);
    if (!Number.isInteger(answer)) {
      const error = new Error('Answer must be a whole number.');
      error.status = 400;
      throw error;
    }

    const correct = answer === session.currentPuzzle.solution;
    const solution = session.currentPuzzle.solution;

    // Clear puzzle so solutions cannot be replayed without a new fetch
    session.currentPuzzle = null;

    if (!session.gameStats) {
      session.gameStats = { score: 0, played: 0, correct: 0 };
    }

    session.gameStats.played += 1;
    if (correct) {
      session.gameStats.correct += 1;
      session.gameStats.score += 10;
    }

    return {
      correct,
      // Reveal solution only after submission for learning feedback
      solution,
      stats: { ...session.gameStats },
    };
  }

  function getStats(session) {
    return session.gameStats || { score: 0, played: 0, correct: 0 };
  }

  function resetStats(session) {
    session.gameStats = { score: 0, played: 0, correct: 0 };
    session.currentPuzzle = null;
    return session.gameStats;
  }

  return { startRound, submitAnswer, getStats, resetStats };
}

module.exports = { createGameService };

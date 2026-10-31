// Thin HTTP layer around game.service — no Banana calls here.
function createGameController(gameService) {
  function begin(req, res, next) {
    try {
      const game = gameService.beginGame(req.session, req.body?.difficulty);
      res.json({ ok: true, game });
    } catch (error) {
      next(error);
    }
  }

  async function newPuzzle(req, res, next) {
    try {
      if (!req.session.gameRun?.gameId) {
        gameService.beginGame(req.session, req.session.gameRun?.difficulty || 'medium');
      }
      const puzzle = await gameService.startRound(req.session);
      res.json({ ok: true, ...puzzle });
    } catch (error) {
      next(error);
    }
  }

  function submit(req, res, next) {
    try {
      const result = gameService.submitAnswer(
        req.session,
        req.body?.answer,
        Boolean(req.body?.timedOut)
      );
      res.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  function end(req, res, next) {
    try {
      res.json({ ok: true, summary: gameService.endGame(req.session) });
    } catch (error) {
      next(error);
    }
  }

  function stats(req, res) {
    res.json({ ok: true, stats: gameService.getStats(req.session) });
  }

  function leaderboard(req, res, next) {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      res.json({ ok: true, entries: gameService.getLeaderboard(limit) });
    } catch (error) {
      next(error);
    }
  }

  function history(req, res, next) {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      res.json({ ok: true, entries: gameService.getHistory(req.session.userId, limit) });
    } catch (error) {
      next(error);
    }
  }

  return { begin, newPuzzle, submit, end, stats, leaderboard, history };
}

module.exports = { createGameController };

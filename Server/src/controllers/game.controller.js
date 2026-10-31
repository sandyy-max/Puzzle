function createGameController(gameService) {
  async function newPuzzle(req, res, next) {
    try {
      const puzzle = await gameService.startRound(req.session);
      res.json({
        ok: true,
        question: puzzle.question,
        issuedAt: puzzle.issuedAt,
        stats: gameService.getStats(req.session),
      });
    } catch (error) {
      next(error);
    }
  }

  function submit(req, res, next) {
    try {
      const result = gameService.submitAnswer(req.session, req.body?.answer);
      res.json({
        ok: true,
        correct: result.correct,
        solution: result.solution,
        stats: result.stats,
      });
    } catch (error) {
      next(error);
    }
  }

  function stats(req, res) {
    res.json({ ok: true, stats: gameService.getStats(req.session) });
  }

  function reset(req, res) {
    res.json({ ok: true, stats: gameService.resetStats(req.session) });
  }

  return { newPuzzle, submit, stats, reset };
}

module.exports = { createGameController };

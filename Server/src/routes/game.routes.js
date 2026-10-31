const express = require('express');
const { requireAuth } = require('../middleware/auth');

function createGameRoutes(gameController) {
  const router = express.Router();

  router.post('/begin', gameController.begin);
  router.get('/puzzle', gameController.newPuzzle);
  router.post('/answer', gameController.submit);
  router.post('/end', gameController.end);
  router.get('/stats', gameController.stats);
  router.get('/leaderboard', gameController.leaderboard);
  router.get('/history', requireAuth, gameController.history);

  return router;
}

module.exports = { createGameRoutes };

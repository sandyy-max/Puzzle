const express = require('express');

function createGameRoutes(gameController) {
  const router = express.Router();

  router.get('/puzzle', gameController.newPuzzle);
  router.post('/answer', gameController.submit);
  router.get('/stats', gameController.stats);
  router.post('/reset', gameController.reset);

  return router;
}

module.exports = { createGameRoutes };

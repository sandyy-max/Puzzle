const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

function createAuthRoutes() {
  const router = express.Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/logout', authController.logout);
  router.get('/me', authController.me);
  router.get('/profile', requireAuth, authController.profile);

  return router;
}

module.exports = { createAuthRoutes };

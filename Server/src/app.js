const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const { createGameService } = require('./services/game.service');
const { createGameController } = require('./controllers/game.controller');
const { createGameRoutes } = require('./routes/game.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(env) {
  const app = express();
  const gameService = createGameService(env);
  const gameController = createGameController(gameService);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use(
    session({
      name: 'banana.sid',
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.nodeEnv === 'production',
        maxAge: 1000 * 60 * 60 * 4,
      },
    })
  );

  const clientPath = path.resolve(__dirname, '../../Client');
  app.use(express.static(clientPath));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'banana-brain' });
  });

  app.use('/api/game', createGameRoutes(gameController));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientPath, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

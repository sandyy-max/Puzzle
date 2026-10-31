const { loadEnvironment } = require('./src/config/environment');
const { initDatabase } = require('./src/config/database');
const { createApp } = require('./src/app');

function start() {
  const env = loadEnvironment();
  initDatabase(env.databasePath);

  const app = createApp(env);
  app.listen(env.port, () => {
    console.log(`Banana Brain running at http://localhost:${env.port}`);
  });
}

start();

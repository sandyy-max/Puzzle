const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs');

process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';
process.env.BANANA_API_URL = 'http://marcconrad.com/uob/banana/api.php';
process.env.DATABASE_PATH = path.join(os.tmpdir(), `banana-test-${Date.now()}.db`);

const { loadEnvironment } = require('../src/config/environment');
const { initDatabase } = require('../src/config/database');
const { createApp } = require('../src/app');

describe('health endpoint', () => {
  it('returns ok', async () => {
    const env = loadEnvironment();
    initDatabase(env.databasePath);
    const app = createApp(env);

    const server = app.listen(0);
    const { port } = server.address();

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.ok, true);
    } finally {
      server.close();
      try {
        fs.unlinkSync(env.databasePath);
      } catch {
        /* ignore */
      }
    }
  });
});

// Register, session cookie, and guest history blocked.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');

process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';
process.env.BANANA_API_URL = 'http://marcconrad.com/uob/banana/api.php';
process.env.DATABASE_PATH = path.join(os.tmpdir(), `banana-auth-${Date.now()}.db`);

const { loadEnvironment } = require('../src/config/environment');
const { initDatabase } = require('../src/config/database');
const { createApp } = require('../src/app');

let base;
let cookie = '';
let server;

async function request(pathname, { method = 'GET', body, cookieHeader } = {}) {
  const res = await fetch(`${base}${pathname}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookieHeader || cookie ? { Cookie: cookieHeader || cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    cookie = setCookie.split(';')[0];
  }
  const data = await res.json();
  return { status: res.status, data };
}

describe('auth and game flow', () => {
  before(() => {
    const env = loadEnvironment();
    initDatabase(env.databasePath);
    server = http.createServer(createApp(env));
    return new Promise((resolve) => {
      server.listen(0, () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(() => new Promise((resolve, reject) => {
    if (!server) return resolve();
    server.close((err) => (err ? reject(err) : resolve()));
  }));

  it('registers, logs in, and blocks history for guests', async () => {
    cookie = '';
    const guestHistory = await request('/api/game/history');
    assert.equal(guestHistory.status, 401);

    const unique = `player${Date.now()}`;
    const registered = await request('/api/auth/register', {
      method: 'POST',
      body: { username: unique, email: `${unique}@test.com`, password: 'secret1' },
    });
    assert.equal(registered.status, 201);
    assert.equal(registered.data.user.username, unique);

    const me = await request('/api/auth/me');
    assert.equal(me.data.user.username, unique);

    const history = await request('/api/game/history');
    assert.equal(history.status, 200);
    assert.ok(Array.isArray(history.data.entries));
  });

  it('rejects a weak password', async () => {
    cookie = '';
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'ab', email: 'bad@test.com', password: '123' },
    });
    assert.equal(res.status, 400);
  });
});

process.on('exit', () => {
  try {
    fs.unlinkSync(process.env.DATABASE_PATH);
  } catch {
    /* ignore */
  }
});

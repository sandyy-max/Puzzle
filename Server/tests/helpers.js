const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');

function cookieFrom(res) {
  const header = res.headers.get('set-cookie');
  if (!header) return '';
  return header.split(';')[0];
}

function startBananaMock(solution = 7) {
  const mock = http.createServer((req, res) => {
    if (req.url.includes('fail=1')) {
      res.statusCode = 502;
      res.end('bad gateway');
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ question: 'https://example.com/puzzle.png', solution }));
  });
  return new Promise((resolve) => {
    mock.listen(0, '127.0.0.1', () => {
      const { port } = mock.address();
      resolve({ mock, url: `http://127.0.0.1:${port}/api.php` });
    });
  });
}

function bootApp(bananaApiUrl) {
  process.env.PORT = '3000';
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test-secret-value';
  process.env.BANANA_API_URL = bananaApiUrl;
  process.env.DATABASE_PATH = path.join(os.tmpdir(), `banana-${Date.now()}-${Math.random()}.db`);

  const { loadEnvironment } = require('../src/config/environment');
  const { initDatabase } = require('../src/config/database');
  const { createApp } = require('../src/app');

  const env = loadEnvironment();
  initDatabase(env.databasePath);
  const server = createApp(env).listen(0);

  return {
    env,
    server,
    port: server.address().port,
    base: `http://127.0.0.1:${server.address().port}`,
  };
}

function closeAll(server, mock, dbPath) {
  return new Promise((resolve) => {
    server.close(() => {
      mock.close(() => {
        try {
          fs.unlinkSync(dbPath);
        } catch {
          /* ignore */
        }
        resolve();
      });
    });
  });
}

function client(base) {
  let cookie = '';

  async function request(pathname, { method = 'GET', body } = {}) {
    const res = await fetch(`${base}${pathname}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const next = cookieFrom(res);
    if (next) cookie = next;
    const data = await res.json().catch(() => null);
    return { status: res.status, data, cookie };
  }

  function resetCookie() {
    cookie = '';
  }

  function setCookie(value) {
    cookie = value;
  }

  return { request, resetCookie, setCookie, getCookie: () => cookie };
}

module.exports = { startBananaMock, bootApp, closeAll, client };

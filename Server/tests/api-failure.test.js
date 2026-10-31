const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startBananaMock, bootApp, closeAll, client } = require('./helpers');

describe('Banana API failures and wrong answers', () => {
  let mock;
  let app;
  let api;

  before(async () => {
    mock = await startBananaMock(4);
    app = bootApp(mock.url);
    api = client(app.base);
  });

  after(() => closeAll(app.server, mock.mock, app.env.databasePath));

  it('returns 502 when the Banana API is down', async () => {
    const down = await startBananaMock(1);
    down.mock.close();
    const broken = bootApp('http://127.0.0.1:9/api.php');
    const brokenApi = client(broken.base);
    await brokenApi.request('/api/game/begin', { method: 'POST', body: { difficulty: 'medium' } });
    const puzzle = await brokenApi.request('/api/game/puzzle');
    assert.equal(puzzle.status, 502);
    assert.equal(puzzle.data.ok, false);
    await closeAll(broken.server, down.mock, broken.env.databasePath);
  });

  it('scores 0 for an incorrect answer', async () => {
    await api.request('/api/game/begin', { method: 'POST', body: { difficulty: 'medium' } });
    await api.request('/api/game/puzzle');
    const result = await api.request('/api/game/answer', {
      method: 'POST',
      body: { answer: 999 },
    });
    assert.equal(result.data.correct, false);
    assert.equal(result.data.solution, 4);
    assert.equal(result.data.pointsAwarded, 0);
    assert.equal(result.data.stats.score, 0);
  });

  it('rejects a duplicate username', async () => {
    const name = `dup${Date.now()}`;
    const first = await api.request('/api/auth/register', {
      method: 'POST',
      body: { username: name, email: `${name}@test.com`, password: 'secret1' },
    });
    assert.equal(first.status, 201);
    api.resetCookie();
    const second = await api.request('/api/auth/register', {
      method: 'POST',
      body: { username: name, email: `${name}2@test.com`, password: 'secret1' },
    });
    assert.equal(second.status, 409);
  });

  it('rejects answer submit with no active puzzle', async () => {
    api.resetCookie();
    const result = await api.request('/api/game/answer', {
      method: 'POST',
      body: { answer: 1 },
    });
    assert.equal(result.status, 400);
  });
});

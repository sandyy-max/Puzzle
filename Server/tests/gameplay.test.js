const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startBananaMock, bootApp, closeAll, client } = require('./helpers');

describe('gameplay and access control', () => {
  let mock;
  let app;
  let api;

  before(async () => {
    mock = await startBananaMock(7);
    app = bootApp(mock.url);
    api = client(app.base);
  });

  after(() => closeAll(app.server, mock.mock, app.env.databasePath));

  it('puzzle JSON does not include the solution', async () => {
    await api.request('/api/game/begin', { method: 'POST', body: { difficulty: 'easy' } });
    const puzzle = await api.request('/api/game/puzzle');
    assert.equal(puzzle.status, 200);
    assert.equal(puzzle.data.question, 'https://example.com/puzzle.png');
    assert.equal(puzzle.data.solution, undefined);
    assert.equal(puzzle.data.timeLimitSec, 45);
  });

  it('awards easy points for a correct answer', async () => {
    const result = await api.request('/api/game/answer', {
      method: 'POST',
      body: { answer: 7 },
    });
    assert.equal(result.data.correct, true);
    assert.equal(result.data.pointsAwarded, 5);
    assert.equal(result.data.stats.score, 5);
  });

  it('rejects a non-integer answer', async () => {
    await api.request('/api/game/puzzle');
    const result = await api.request('/api/game/answer', {
      method: 'POST',
      body: { answer: 'seven' },
    });
    assert.equal(result.status, 400);
  });

  it('marks a timeout as incorrect', async () => {
    await api.request('/api/game/puzzle');
    const result = await api.request('/api/game/answer', {
      method: 'POST',
      body: { answer: 7, timedOut: true },
    });
    assert.equal(result.data.correct, false);
    assert.equal(result.data.timedOut, true);
    assert.equal(result.data.pointsAwarded, 0);
  });

  it('blocks history without login', async () => {
    api.resetCookie();
    const history = await api.request('/api/game/history');
    assert.equal(history.status, 401);
  });

  it('saves history for the owner only', async () => {
    const a = `ann${Date.now()}`;
    const b = `bob${Date.now()}`;

    const playerA = client(app.base);
    await playerA.request('/api/auth/register', {
      method: 'POST',
      body: { username: a, email: `${a}@test.com`, password: 'secret1' },
    });
    await playerA.request('/api/game/begin', { method: 'POST', body: { difficulty: 'hard' } });
    await playerA.request('/api/game/puzzle');
    await playerA.request('/api/game/answer', { method: 'POST', body: { answer: 7 } });
    const ended = await playerA.request('/api/game/end', { method: 'POST', body: {} });
    assert.equal(ended.data.summary.savedToLeaderboard, true);
    assert.equal(ended.data.summary.score, 15);

    const mine = await playerA.request('/api/game/history');
    assert.equal(mine.status, 200);
    assert.equal(mine.data.entries.length, 1);
    assert.equal(mine.data.entries[0].score, 15);

    const playerB = client(app.base);
    await playerB.request('/api/auth/register', {
      method: 'POST',
      body: { username: b, email: `${b}@test.com`, password: 'secret1' },
    });
    const other = await playerB.request('/api/game/history');
    assert.equal(other.data.entries.length, 0);

    const board = await playerB.request('/api/game/leaderboard');
    assert.ok(board.data.entries.some((row) => row.username === a && row.score === 15));
  });

  it('logout clears the session', async () => {
    const name = `out${Date.now()}`;
    const player = client(app.base);
    await player.request('/api/auth/register', {
      method: 'POST',
      body: { username: name, email: `${name}@test.com`, password: 'secret1' },
    });
    await player.request('/api/auth/logout', { method: 'POST', body: {} });
    const me = await player.request('/api/auth/me');
    assert.equal(me.data.user, null);
    const history = await player.request('/api/game/history');
    assert.equal(history.status, 401);
  });

  it('login fails with a wrong password', async () => {
    const name = `pw${Date.now()}`;
    const player = client(app.base);
    await player.request('/api/auth/register', {
      method: 'POST',
      body: { username: name, email: `${name}@test.com`, password: 'secret1' },
    });
    player.resetCookie();
    const bad = await player.request('/api/auth/login', {
      method: 'POST',
      body: { username: name, password: 'nope-no' },
    });
    assert.equal(bad.status, 401);
  });
});

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveDifficulty, getDifficultyConfig } = require('../src/utils/difficulty');

describe('difficulty', () => {
  it('falls back to medium for unknown names', () => {
    assert.equal(resolveDifficulty('extreme'), 'medium');
    assert.equal(getDifficultyConfig('easy').points, 5);
    assert.equal(getDifficultyConfig('hard').timeLimitSec, 20);
  });
});

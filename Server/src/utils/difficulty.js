/**
 * Banana API has no difficulty param — we apply timing/points locally.
 * Docs: https://marcconrad.com/uob/banana/doc.php
 */
const DIFFICULTIES = {
  easy: { label: 'Easy', timeLimitSec: 45, points: 5 },
  medium: { label: 'Medium', timeLimitSec: 30, points: 10 },
  hard: { label: 'Hard', timeLimitSec: 20, points: 15 },
};

function resolveDifficulty(name) {
  const key = String(name || 'medium').toLowerCase();
  return DIFFICULTIES[key] ? key : 'medium';
}

function getDifficultyConfig(name) {
  return DIFFICULTIES[resolveDifficulty(name)];
}

module.exports = { DIFFICULTIES, resolveDifficulty, getDifficultyConfig };

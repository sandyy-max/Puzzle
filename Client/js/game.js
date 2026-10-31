import { gameApi } from './api.js';
import { renderNav } from './auth.js';
import {
  $,
  setStats,
  showFeedback,
  clearFeedback,
  setLoading,
  showPuzzleImage,
  showPlaceholder,
} from './ui.js';

let puzzleActive = false;
let timerId = null;
let remaining = 0;
let currentUser = null;

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function paintTimer() {
  const el = $('#timer');
  if (!el) return;
  el.textContent = `${remaining}s`;
  el.classList.toggle('warn', remaining <= 10 && remaining > 5);
  el.classList.toggle('late', remaining <= 5);
}

function startTimer(seconds) {
  stopTimer();
  remaining = seconds;
  paintTimer();
  timerId = setInterval(async () => {
    remaining -= 1;
    paintTimer();
    if (remaining <= 0) {
      stopTimer();
      await submitAnswer(true);
    }
  }, 1000);
}

function selectedDifficulty() {
  return $('#difficulty')?.dataset.value || 'medium';
}

async function beginAndLoad() {
  clearFeedback();
  setLoading(true);
  showPlaceholder();
  puzzleActive = false;
  stopTimer();

  try {
    await gameApi.begin(selectedDifficulty());
    const data = await gameApi.newPuzzle();
    showPuzzleImage(data.question);
    setStats(data.stats);
    puzzleActive = true;
    $('#answer').value = '';
    $('#answer').focus();
    startTimer(data.timeLimitSec);
    showFeedback('info', `Find the missing digit. ${data.timeLimitSec}s on ${data.difficulty}.`);
  } catch (error) {
    showFeedback('error', error.message || 'Could not load a puzzle.');
  } finally {
    setLoading(false);
  }
}

async function nextPuzzle() {
  if (!puzzleActive && !$('#stat-played')?.textContent) {
    return beginAndLoad();
  }
  clearFeedback();
  setLoading(true);
  stopTimer();
  try {
    const data = await gameApi.newPuzzle();
    showPuzzleImage(data.question);
    setStats(data.stats);
    puzzleActive = true;
    $('#answer').value = '';
    $('#answer').focus();
    startTimer(data.timeLimitSec);
    showFeedback('info', 'New puzzle ready.');
  } catch (error) {
    showFeedback('error', error.message);
  } finally {
    setLoading(false);
  }
}

async function submitAnswer(timedOut = false, event) {
  event?.preventDefault();
  if (!puzzleActive) {
    showFeedback('error', 'Start a game first.');
    return;
  }

  const raw = $('#answer').value.trim();
  if (!timedOut && (raw === '' || !/^-?\d+$/.test(raw))) {
    showFeedback('error', 'Please enter a whole number.');
    return;
  }

  stopTimer();
  setLoading(true);
  puzzleActive = false;

  try {
    const data = await gameApi.submitAnswer(timedOut ? 0 : Number(raw), timedOut);
    setStats(data.stats);

    if (data.timedOut) {
      showFeedback('error', `Time’s up. The solution was ${data.solution}.`);
    } else if (data.correct) {
      showFeedback('success', `Correct! +${data.pointsAwarded} points.`);
    } else {
      showFeedback('error', `Not quite. The solution was ${data.solution}.`);
    }
  } catch (error) {
    showFeedback('error', error.message);
  } finally {
    setLoading(false);
  }
}

async function endGame() {
  stopTimer();
  setLoading(true);
  try {
    const data = await gameApi.end();
    puzzleActive = false;
    showPlaceholder();
    setStats(data.summary);
    const saved = data.summary.savedToLeaderboard
      ? 'Saved to your history and the leaderboard.'
      : 'Guest score was not saved. Log in to keep your results.';
    showFeedback('info', `Game over — ${data.summary.score} points. ${saved}`);
  } catch (error) {
    showFeedback('error', error.message);
  } finally {
    setLoading(false);
  }
}

function bindDifficulty() {
  document.querySelectorAll('[data-level]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-level]').forEach((el) => el.classList.remove('active'));
      btn.classList.add('active');
      $('#difficulty').dataset.value = btn.dataset.level;
    });
  });
}

function bindEvents() {
  $('#btn-new')?.addEventListener('click', beginAndLoad);
  $('#btn-next')?.addEventListener('click', nextPuzzle);
  $('#answer-form')?.addEventListener('submit', (event) => submitAnswer(false, event));
  $('#btn-end')?.addEventListener('click', endGame);
  bindDifficulty();
}

async function init() {
  currentUser = await renderNav();
  bindEvents();
  if (!currentUser) {
    showFeedback('info', 'Play as a guest, or register to save scores.');
  }
}

document.addEventListener('DOMContentLoaded', init);

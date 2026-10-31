import { gameApi } from './api.js';
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

async function loadPuzzle() {
  clearFeedback();
  setLoading(true);
  showPlaceholder();
  puzzleActive = false;

  try {
    const data = await gameApi.newPuzzle();
    showPuzzleImage(data.question);
    setStats(data.stats);
    puzzleActive = true;
    $('#answer').value = '';
    $('#answer').focus();
    showFeedback('info', 'Puzzle ready — enter the missing digit.');
  } catch (error) {
    showFeedback('error', error.message || 'Could not load puzzle from Banana API.');
  } finally {
    setLoading(false);
  }
}

async function submitAnswer(event) {
  event.preventDefault();
  if (!puzzleActive) {
    showFeedback('error', 'Start a new puzzle first.');
    return;
  }

  const raw = $('#answer').value.trim();
  if (raw === '' || !/^-?\d+$/.test(raw)) {
    showFeedback('error', 'Please enter a whole number.');
    return;
  }

  setLoading(true);
  try {
    const data = await gameApi.submitAnswer(Number(raw));
    setStats(data.stats);
    puzzleActive = false;

    if (data.correct) {
      showFeedback('success', `Correct! +10 points. Solution was ${data.solution}.`);
    } else {
      showFeedback('error', `Not quite. The solution was ${data.solution}.`);
    }
  } catch (error) {
    showFeedback('error', error.message || 'Could not check your answer.');
  } finally {
    setLoading(false);
  }
}

async function resetGame() {
  setLoading(true);
  try {
    const data = await gameApi.reset();
    setStats(data.stats);
    puzzleActive = false;
    showPlaceholder();
    clearFeedback();
    $('#answer').value = '';
    showFeedback('info', 'Score reset. Load a new puzzle when ready.');
  } catch (error) {
    showFeedback('error', error.message || 'Reset failed.');
  } finally {
    setLoading(false);
  }
}

function bindEvents() {
  $('#btn-new').addEventListener('click', loadPuzzle);
  $('#answer-form').addEventListener('submit', submitAnswer);
  $('#btn-reset').addEventListener('click', resetGame);
}

async function init() {
  bindEvents();
  try {
    await gameApi.health();
    const data = await gameApi.stats();
    setStats(data.stats);
  } catch {
    showFeedback('error', 'Server is not reachable. Run npm start and refresh.');
  }
}

document.addEventListener('DOMContentLoaded', init);

// Leaderboard and profile tables.
import { gameApi, authApi } from './api.js';
import { renderNav } from './auth.js';
import { $ } from './ui.js';

function rows(entries) {
  if (!entries.length) {
    return `<tr><td colspan="5" class="empty">No finished games yet.</td></tr>`;
  }
  return entries
    .map(
      (row, i) => `<tr>
        <td>${i + 1}</td>
        <td>${row.username}</td>
        <td>${row.score}</td>
        <td><span class="badge">${row.difficulty}</span></td>
        <td>${row.roundsCorrect}/${row.roundsPlayed}</td>
      </tr>`
    )
    .join('');
}

function historyRows(entries) {
  if (!entries.length) {
    return `<p class="empty">Finish a game while logged in to see history here.</p>`;
  }
  return `<table class="board"><thead><tr>
      <th>Score</th><th>Level</th><th>Correct</th><th>When</th>
    </tr></thead><tbody>
    ${entries
      .map(
        (row) => `<tr>
        <td>${row.score}</td>
        <td><span class="badge">${row.difficulty}</span></td>
        <td>${row.roundsCorrect}/${row.roundsPlayed}</td>
        <td>${row.finishedAt || ''}</td>
      </tr>`
      )
      .join('')}
    </tbody></table>`;
}

export async function loadLeaderboard() {
  await renderNav();
  const body = $('#board-body');
  if (!body) return;
  try {
    const data = await gameApi.leaderboard();
    body.innerHTML = rows(data.entries);
  } catch (error) {
    body.innerHTML = `<tr><td colspan="5" class="empty">${error.message}</td></tr>`;
  }
}

export async function loadProfile() {
  const user = await renderNav();
  const statsHost = $('#profile-stats');
  const historyHost = $('#history');
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }

  try {
    const profile = await authApi.profile();
    const s = profile.profile.stats;
    $('#profile-name').textContent = profile.profile.username;
    $('#profile-email').textContent = profile.profile.email;
    statsHost.innerHTML = `
      <div class="stat-pill"><span>Games</span><strong>${s.gamesPlayed}</strong></div>
      <div class="stat-pill"><span>Best</span><strong>${s.bestScore}</strong></div>
      <div class="stat-pill"><span>Total</span><strong>${s.totalScore}</strong></div>
      <div class="stat-pill"><span>Correct</span><strong>${s.totalCorrect}</strong></div>`;

    const history = await gameApi.history();
    historyHost.innerHTML = historyRows(history.entries);
  } catch (error) {
    historyHost.textContent = error.message;
  }
}

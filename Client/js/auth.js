import { authApi } from './api.js';
import { $ } from './ui.js';

function navHtml(user) {
  const play = `<a href="/index.html">Play</a>`;
  const board = `<a href="/pages/leaderboard.html">Leaderboard</a>`;
  if (user) {
    return `${play}${board}<a href="/pages/profile.html">Profile</a>
      <span class="user-chip">${user.username}</span>
      <button type="button" id="btn-logout">Log out</button>`;
  }
  return `${play}${board}<a href="/pages/login.html">Log in</a>
    <a href="/pages/register.html">Register</a>`;
}

export async function renderNav() {
  const host = $('#nav');
  if (!host) return null;

  let user = null;
  try {
    const data = await authApi.me();
    user = data.user;
  } catch {
    user = null;
  }

  host.innerHTML = navHtml(user);
  $('#btn-logout')?.addEventListener('click', async () => {
    await authApi.logout();
    window.location.href = '/index.html';
  });
  return user;
}

export function bindAuthForm(mode) {
  const form = $('#auth-form');
  const feedback = $('#feedback');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.className = 'feedback';
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      if (mode === 'register') {
        await authApi.register(payload);
      } else {
        await authApi.login({ username: payload.username, password: payload.password });
      }
      window.location.href = '/index.html';
    } catch (error) {
      feedback.className = 'feedback show error';
      feedback.textContent = error.message;
    }
  });
}

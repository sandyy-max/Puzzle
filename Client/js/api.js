/** Shared fetch helper — always sends the session cookie. */
async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || (data && data.ok === false)) {
    const error = new Error((data && data.error) || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const gameApi = {
  health: () => apiRequest('/api/health'),
  begin: (difficulty) =>
    apiRequest('/api/game/begin', {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    }),
  newPuzzle: () => apiRequest('/api/game/puzzle'),
  submitAnswer: (answer, timedOut = false) =>
    apiRequest('/api/game/answer', {
      method: 'POST',
      body: JSON.stringify({ answer, timedOut }),
    }),
  end: () => apiRequest('/api/game/end', { method: 'POST', body: JSON.stringify({}) }),
  stats: () => apiRequest('/api/game/stats'),
  leaderboard: () => apiRequest('/api/game/leaderboard'),
  history: () => apiRequest('/api/game/history'),
};

export const authApi = {
  me: () => apiRequest('/api/auth/me'),
  register: (payload) =>
    apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }),
  profile: () => apiRequest('/api/auth/profile'),
};

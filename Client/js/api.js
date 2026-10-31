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
    const message = (data && data.error) || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const gameApi = {
  health: () => apiRequest('/api/health'),
  newPuzzle: () => apiRequest('/api/game/puzzle'),
  submitAnswer: (answer) =>
    apiRequest('/api/game/answer', {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
  stats: () => apiRequest('/api/game/stats'),
  reset: () =>
    apiRequest('/api/game/reset', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

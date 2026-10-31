// Small DOM helpers shared by the play screen.
export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function setStats(stats) {
  const map = {
    '#stat-score': stats?.score ?? 0,
    '#stat-correct': stats?.correct ?? 0,
    '#stat-played': stats?.played ?? 0,
  };
  Object.entries(map).forEach(([sel, value]) => {
    const el = $(sel);
    if (el) el.textContent = String(value);
  });
}

export function showFeedback(type, message) {
  const el = $('#feedback');
  if (!el) return;
  el.className = `feedback show ${type}`;
  el.textContent = message;
}

export function clearFeedback() {
  const el = $('#feedback');
  if (!el) return;
  el.className = 'feedback';
  el.textContent = '';
}

export function setLoading(isLoading) {
  $('#loading')?.classList.toggle('show', isLoading);
  ['#btn-new', '#btn-submit', '#btn-end', '#answer'].forEach((sel) => {
    const el = $(sel);
    if (el) el.disabled = isLoading;
  });
}

export function showPuzzleImage(url) {
  const stage = $('#puzzle-stage');
  const placeholder = $('#placeholder');
  if (!stage) return;
  placeholder && (placeholder.hidden = true);

  let img = $('#puzzle-image');
  if (!img) {
    img = document.createElement('img');
    img.id = 'puzzle-image';
    img.alt = 'Banana puzzle — find the missing digit';
    stage.appendChild(img);
  }
  img.src = url;
}

export function showPlaceholder() {
  $('#puzzle-image')?.remove();
  const placeholder = $('#placeholder');
  if (placeholder) placeholder.hidden = false;
}

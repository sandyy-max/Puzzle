export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function setStats(stats) {
  $('#stat-score').textContent = String(stats?.score ?? 0);
  $('#stat-correct').textContent = String(stats?.correct ?? 0);
  $('#stat-played').textContent = String(stats?.played ?? 0);
}

export function showFeedback(type, message) {
  const el = $('#feedback');
  el.className = `feedback show ${type}`;
  el.textContent = message;
}

export function clearFeedback() {
  const el = $('#feedback');
  el.className = 'feedback';
  el.textContent = '';
}

export function setLoading(isLoading) {
  $('#loading').classList.toggle('show', isLoading);
  $('#btn-new').disabled = isLoading;
  $('#btn-submit').disabled = isLoading;
  $('#answer').disabled = isLoading;
}

export function showPuzzleImage(url) {
  const stage = $('#puzzle-stage');
  const placeholder = $('#placeholder');
  let img = $('#puzzle-image');

  placeholder.hidden = true;

  if (!img) {
    img = document.createElement('img');
    img.id = 'puzzle-image';
    img.alt = 'Banana puzzle — find the missing digit';
    stage.appendChild(img);
  }

  img.src = url;
}

export function showPlaceholder() {
  const img = $('#puzzle-image');
  if (img) img.remove();
  $('#placeholder').hidden = false;
}

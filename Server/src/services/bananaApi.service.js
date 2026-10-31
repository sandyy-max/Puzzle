/**
 * Banana API client — official docs: https://marcconrad.com/uob/banana/doc.php
 * AI-assisted scaffolding; endpoint and response shape verified against Marc Conrad docs.
 */

async function fetchPuzzle(bananaApiUrl) {
  const url = new URL(bananaApiUrl);
  url.searchParams.set('out', 'json');
  url.searchParams.set('base64', 'no');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Banana API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data || typeof data.question !== 'string' || data.solution === undefined) {
      throw new Error('Banana API returned an unexpected payload');
    }

    const solution = Number(data.solution);
    if (!Number.isFinite(solution)) {
      throw new Error('Banana API solution is not a number');
    }

    return {
      question: data.question,
      solution,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Banana API request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchPuzzle };

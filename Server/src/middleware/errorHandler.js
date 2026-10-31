// JSON errors for the client. Hide internals when NODE_ENV is production.
function notFound(req, res) {
  res.status(404).json({ ok: false, error: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Unexpected error';

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ ok: false, error: message });
}

module.exports = { notFound, errorHandler };

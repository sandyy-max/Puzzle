/** Blocks the route unless the session has a logged-in user. */
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ ok: false, error: 'Login required.' });
  }
  next();
}

/** Attaches req.userId when present; guests still allowed. */
function optionalAuth(req, res, next) {
  req.userId = req.session?.userId || null;
  next();
}

module.exports = { requireAuth, optionalAuth };

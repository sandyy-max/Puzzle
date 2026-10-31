/** 401 unless the session has a userId. */
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

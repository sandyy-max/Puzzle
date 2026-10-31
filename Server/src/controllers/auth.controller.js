const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body || {});
    // Regenerating session avoids session-fixation attacks after auth.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      res.status(201).json({ ok: true, user });
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await authService.login(req.body || {});
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      res.json({ ok: true, user });
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res, next) {
  try {
    const user = authService.getSessionUser(req.session.userId);
    res.json({ ok: true, user });
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('banana.sid');
    res.json({ ok: true });
  });
}

function profile(req, res, next) {
  try {
    const profileData = authService.getProfile(req.session.userId);
    res.json({ ok: true, profile: profileData });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me, logout, profile };

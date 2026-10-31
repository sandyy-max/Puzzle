function isValidUsername(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(value);
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}

function isValidPassword(value) {
  return typeof value === 'string' && value.length >= 6 && value.length <= 72;
}

module.exports = { isValidUsername, isValidEmail, isValidPassword };

// Register / login rules. Password hash never leaves this layer.
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const { isValidUsername, isValidEmail, isValidPassword } = require('../utils/validators');

const SALT_ROUNDS = 10;

async function register({ username, email, password }) {
  if (!isValidUsername(username)) {
    const error = new Error('Username must be 3–20 characters (letters, numbers, _).');
    error.status = 400;
    throw error;
  }
  if (!isValidEmail(email)) {
    const error = new Error('Enter a valid email address.');
    error.status = 400;
    throw error;
  }
  if (!isValidPassword(password)) {
    const error = new Error('Password must be at least 6 characters.');
    error.status = 400;
    throw error;
  }

  if (userModel.findByUsername(username)) {
    const error = new Error('That username is already taken.');
    error.status = 409;
    throw error;
  }
  if (userModel.findByEmail(email)) {
    const error = new Error('That email is already registered.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userModel.createUser({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
  });

  return publicUser(user);
}

async function login({ username, password }) {
  if (!username || !password) {
    const error = new Error('Username and password are required.');
    error.status = 400;
    throw error;
  }

  const user = userModel.findByUsername(username);
  if (!user) {
    const error = new Error('Invalid username or password.');
    error.status = 401;
    throw error;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const error = new Error('Invalid username or password.');
    error.status = 401;
    throw error;
  }

  return publicUser(user);
}

function getSessionUser(userId) {
  if (!userId) return null;
  const user = userModel.findById(userId);
  return user ? publicUser(user) : null;
}

function getProfile(userId) {
  const user = userModel.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  const stats = userModel.getProfileStats(userId);
  return { ...publicUser(user), stats };
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

module.exports = { register, login, getSessionUser, getProfile };

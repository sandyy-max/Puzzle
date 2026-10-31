const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const required = ['PORT', 'SESSION_SECRET', 'BANANA_API_URL', 'DATABASE_PATH'];

function loadEnvironment() {
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    sessionSecret: process.env.SESSION_SECRET,
    bananaApiUrl: process.env.BANANA_API_URL,
    databasePath: path.resolve(__dirname, '../../..', process.env.DATABASE_PATH),
  };
}

module.exports = { loadEnvironment };

const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || "http://localhost:3000";

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";

const SESSION_SECRET = "sleepy cat";

const corsOption = {
  origin: CLIENT_ENDPOINT,
  credentials: true
};

module.exports = {
  corsOption,
  CLIENT_ENDPOINT,
  REDIS_PORT,
  REDIS_HOST,
  SESSION_SECRET
};
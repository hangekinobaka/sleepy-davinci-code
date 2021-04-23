
const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
const ORIGIN = process.env.ORIGIN || 'http://localhost';

const corsOption = {
  origin: `${ORIGIN}:${CLIENT_PORT}`,
  credentials: true
}

module.exports = {corsOption}
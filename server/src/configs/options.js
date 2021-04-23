const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || "http://localhost:3000";

const corsOption = {
  origin: CLIENT_ENDPOINT,
  credentials: true
};

module.exports = {corsOption};
const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || "http://localhost:3000";

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";

const SESSION_SECRET = "sleepy cat";
const SESSION_EXPIRE_TIME = 1000 * 60 * 60 * 3; // in ms, 3 hours here
const SESSION_LEAVE_COUNT_DOWN = 1000 * 60 * 3; // in ms, 3 miutes here
const ROOM_DATA_EXPIRE_TIME =  60 * 60 * 3; // in s, 3 hours here

const corsOption = {
  origin: CLIENT_ENDPOINT,
  credentials: true
};

const redis_keys = {
  ROOM_POINTER: "room_pointer",
  ROOM_DATA:"room_data:",
  USER_DATA:"user_data:",
  PUBLIC_QUEUE:"public_room_queue"
};

module.exports = {
  corsOption,
  CLIENT_ENDPOINT,
  REDIS_PORT,
  REDIS_HOST,
  SESSION_SECRET,
  SESSION_EXPIRE_TIME,
  SESSION_LEAVE_COUNT_DOWN,
  ROOM_DATA_EXPIRE_TIME,
  redis_keys
};
const {REDIS_PORT, REDIS_HOST} = require("./config");
const redis = require("redis");
const { promisify } = require("util");


function PromiseClient() {
  // constructor
  this._client = redis.createClient(REDIS_PORT, REDIS_HOST);
  
  // method binding
  this.get = promisify(this._client.get).bind(this._client);

  this.sadd = promisify(this._client.sadd).bind(this._client);
  this.smembers = promisify(this._client.smembers).bind(this._client);
  this.sismember = promisify(this._client.sismember).bind(this._client);

  this.hget = promisify(this._client.hget).bind(this._client);
  this.hmset = promisify(this._client.hmset).bind(this._client);
  this.hset = promisify(this._client.hset).bind(this._client);

  this.quit = (this._client.quit).bind(this._client);

  // methods
  this.getClient = function(){
    return this._client;
  };

}

module.exports = new PromiseClient();

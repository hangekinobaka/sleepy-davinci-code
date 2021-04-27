const {REDIS_PORT, REDIS_HOST} = require("../variables/config");
const redis = require("redis");
const { promisify } = require("util");

function PromiseClient () {
  // constructor
  this._client = redis.createClient(REDIS_PORT, REDIS_HOST);
  
  // method binding
  this.set = promisify(this._client.set).bind(this._client);
  this.setex = promisify(this._client.setex).bind(this._client);
  this.get = promisify(this._client.get).bind(this._client);
  this.del = promisify(this._client.del).bind(this._client);
  this.pexpire = promisify(this._client.pexpire).bind(this._client);

  this.sadd = promisify(this._client.sadd).bind(this._client);
  this.smembers = promisify(this._client.smembers).bind(this._client);
  this.sismember = promisify(this._client.sismember).bind(this._client);

  this.hget = promisify(this._client.hget).bind(this._client);
  this.hmset = promisify(this._client.hmset).bind(this._client);
  this.hset = promisify(this._client.hset).bind(this._client);

  this.lpush = promisify(this._client.lpush).bind(this._client); 
  this.brpop = promisify(this._client.brpop).bind(this._client);
  this.lindex = promisify(this._client.lindex).bind(this._client);
  this.llen = promisify(this._client.llen).bind(this._client);

  this.quit = (this._client.quit).bind(this._client);

  // methods
  this.getClient = function(){
    return this._client;
  };

}

module.exports = PromiseClient;

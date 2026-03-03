/* 
redis connection establich file from this file we can see redis is connected
or not and also we can export the redis client to use in other files
*/

const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  }
}

module.exports = { redisClient, connectRedis };
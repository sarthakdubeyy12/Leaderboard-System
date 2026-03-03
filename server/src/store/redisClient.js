/* 
redis connection helper. Exports client and connectRedis().
*/

const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log("✅ Connected to Redis");
    } catch (err) {
      console.error("Failed to connect to Redis", err);
      await new Promise((r) => setTimeout(r, 1000));
      await redisClient.connect();
      console.log("✅ Connected to Redis on retry");
    }
  }
}

module.exports = { redisClient, connectRedis };
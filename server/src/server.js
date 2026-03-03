/* 
Server entry point; starts the app after connecting to Redis.
*/

const app = require("./app");
const { connectRedis } = require("./store/redisClient");

const PORT = parseInt(process.env.PORT, 10) || 5001;

async function startServer() {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);  // running port
  });
}

startServer();
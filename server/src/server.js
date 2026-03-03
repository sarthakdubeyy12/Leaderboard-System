/* 
port file of the server act as a entry point
*/

const app = require("./app");
const { connectRedis } = require("./store/redisClient");

const PORT = 5001;

async function startServer() {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);  // running port
  });
}

startServer();
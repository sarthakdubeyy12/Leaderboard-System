/**
 * from this benchmark file we can test 10k updates to the leaderboard and gauge performance
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5001/leaderboard/update";
const TOTAL_REQUESTS = 10000; // total number of updates
const CONCURRENT_BATCH = 200; // no. of parallel requests

async function runBenchmark() {
  console.log("🚀 Starting benchmark...");
  const start = Date.now();

  let promises = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const userId = `user_${i % 1000}`; // reuse 1000 users

    promises.push(
      axios.post(BASE_URL, {
        user_id: userId,
        delta: Math.floor(Math.random() * 10),
      }),
    );
    // execute requests in batches instead of firing all 10k at once.
    if (promises.length === CONCURRENT_BATCH) {
      await Promise.all(promises);
      promises = [];
    }
  }
  // handle any remaining requests in the last batch.
  if (promises.length > 0) {
    await Promise.all(promises);
  }

  const end = Date.now();
  console.log("Benchmark completed");
  console.log(`Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`Total Time: ${(end - start) / 1000}s`);
  console.log(`Throughput: ${(TOTAL_REQUESTS / ((end - start) / 1000)).toFixed(2)} req/sec`,
  );
}
runBenchmark().catch(console.error);

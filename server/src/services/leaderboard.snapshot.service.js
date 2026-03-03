/**
 * this service is responsible for handling the historical view of the leaderboard.
 * at any given time, we're effectively taking a “snapshot” of the current leaderboard by
 * creating a Redis key that's a copy of the ZSET.
 */

const { redisClient } = require("../store/redisClient");

class SnapshotService {

  async createSnapshot() {
    const timestamp = Date.now();
    const snapshotKey = `leaderboard:snapshot:${timestamp}`;

   // fetch entire current leaderboard state.
    const allPlayers = await redisClient.zRangeWithScores(
      "leaderboard",
      0,
      -1
    );

    // recreate the same sorted set under a new timestamped key using pipeline
    if (allPlayers.length > 0) {
      const pipeline = redisClient.multi();
      for (const player of allPlayers) {
        pipeline.zAdd(snapshotKey, { score: player.score, value: player.value });
      }
      await pipeline.exec();
    }

    return timestamp;
  }

  async getTopKAt(k, timestamp) {
    const snapshotKey = `leaderboard:snapshot:${timestamp}`;

    // read from the frozen snapshot instead of live leaderboard.
    // using REV ensures descending score order.
    const results = await redisClient.zRangeWithScores(
      snapshotKey,
      0,
      k - 1,
      { REV: true }
    );

    return results.map(entry => ({
      user_id: entry.value,
      score: parseFloat(entry.score)
    }));
  }
}

module.exports = new SnapshotService();
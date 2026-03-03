/**
 * redis Sorted Sets (ZSET) is our data structure of choice for the leaderboard
 * because: O(log n) for updates, O(log n) for lookup by rank, O(k) for top k retrieval
 */

const { redisClient } = require("../store/redisClient");

const LEADERBOARD_KEY = "leaderboard";

class LeaderboardService {
  async updateScore(userId, delta) {
    // Lua is being used here to ensure the operation is atomic.
    // without this overwrite each other.

    const luaScript = `
    local leaderboardKey = KEYS[1]
    local eventsKey = KEYS[2]

    local userId = ARGV[1]
    local delta = tonumber(ARGV[2])
    local timestamp = ARGV[3]

    local current = redis.call("ZSCORE", leaderboardKey, userId)

    if not current then
      current = 0
    else
      current = tonumber(current)
    end

    local newScore = current + delta

    if newScore < 0 then
      newScore = 0
    end

    redis.call("ZADD", leaderboardKey, newScore, userId)

    local event = cjson.encode({
      userId = userId,
      delta = delta,
      newScore = newScore,
      timestamp = timestamp
    })

    redis.call("RPUSH", eventsKey, event)

    return newScore
  `;

    const newScore = await redisClient.eval(luaScript, {
      keys: [LEADERBOARD_KEY, "leaderboard:events"],
      arguments: [userId, delta.toString(), Date.now().toString()],
    });

    return parseFloat(newScore);
  }

  // get Top K players
  async getTopK(k) {
    // we reverse the range because Redis sorts ascending by default.
    // using REV gives us highest scores first.
    const results = await redisClient.zRangeWithScores(
      LEADERBOARD_KEY,
      0,
      k - 1,
      { REV: true },
    );

    return results.map((entry) => ({
      user_id: entry.value,
      score: parseFloat(entry.score),
    }));
  }

  // get rank (1-based)
  async getRank(userId) {
    // zRevRank returns 0-based rank in descending order.
    const rank = await redisClient.zRevRank(LEADERBOARD_KEY, userId);

    if (rank === null) return -1;

    return rank + 1;
  }

  // get players within rank range (1-based inclusive)
  async getPlayersInRange(start, end) {
    // range queries are handled directly by Redis without scanning the full dataset.
    const results = await redisClient.zRangeWithScores(
      LEADERBOARD_KEY,
      start - 1,
      end - 1,
      { REV: true },
    );

    return results.map((entry) => ({
      user_id: entry.value,
      score: parseFloat(entry.score),
    }));
  }
}
module.exports = new LeaderboardService();

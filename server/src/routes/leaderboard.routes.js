/**
 * try/catch to catch the error and all the routes are here.
*/
const express = require("express");
const router = express.Router();

const leaderboardService = require("../services/leaderboard.service");
const snapshotService = require("../services/leaderboard.snapshot.service");
const { validateUpdate } = require("../middleware/validate");


// update score
// atomic score handling to the service layer.
router.post("/update", validateUpdate, async (req, res, next) => {
  try {
    const { user_id, delta } = req.body;
    const newScore = await leaderboardService.updateScore(user_id, delta);
    res.json({ user_id, newScore });
  } catch (err) {
    next(err);
  }
});


// fetch top K players.
router.get("/top", async (req, res, next) => {
  try {
    const k = parseInt(req.query.k) || 10;
    const topPlayers = await leaderboardService.getTopK(k);
    res.json(topPlayers);
  } catch (err) {
    next(err);
  }
});


// get 1-based rank of a user.
// rank logic is handled efficiently by Redis in O(log n).
router.get("/rank/:userId", async (req, res, next) => {
  try {
    const rank = await leaderboardService.getRank(req.params.userId);
    res.json({ rank });
  } catch (err) {
    next(err);
  }
});


// get players within a rank range (inclusive).
router.get("/range", async (req, res, next) => {
  try {
    const start = parseInt(req.query.start);
    const end = parseInt(req.query.end);

    if (!start || !end || start < 1 || end < start) {
      return res.status(400).json({ error: "Invalid range" });
    }
    const players = await leaderboardService.getPlayersInRange(start, end);
    res.json(players);
  } catch (err) {
    next(err);
  }
});


// create a snapshot of the current leaderboard state.
router.post("/snapshot", async (req, res, next) => {
  try {
    const timestamp = await snapshotService.createSnapshot();
    res.json({ snapshotTimestamp: timestamp });
  } catch (err) {
    next(err);
  }
});


// fetch top-k results from a specific snapshot timestamp.
router.get("/top-at", async (req, res, next) => {
  try {
    const k = parseInt(req.query.k);
    const timestamp = parseInt(req.query.timestamp);
    if (!k || !timestamp) {
      return res.status(400).json({ error: "Invalid k or timestamp" });
    }
    const result = await snapshotService.getTopKAt(k, timestamp);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
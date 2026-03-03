/* 
centralised file for express app, we can add all the middlewares and routes here
*/

const express = require("express");
const leaderboardRoutes = require("./routes/leaderboard.routes");

const app = express();

// body parser
app.use(express.json());

// routes
app.use("/leaderboard", leaderboardRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Leaderboard API!");
});


// centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});

module.exports = app;
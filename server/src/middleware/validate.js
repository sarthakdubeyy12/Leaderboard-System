/* 
act as a middleware for validating incoming request
it checks if the user_id is a string and if the delta is a number. 
*/

function validateUpdate(req, res, next) {
  const { user_id, delta } = req.body;

  // validate user_id is a non‑empty string
  if (!user_id || typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  // allow numeric strings for delta; convert to number
  if (typeof delta === "string") {
    const parsed = parseFloat(delta);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return res.status(400).json({ error: "Delta must be a number" });
    }
    req.body.delta = parsed;
  } else if (typeof delta !== "number") {
    return res.status(400).json({ error: "Delta must be a number" });
  }

  next();
}
module.exports = { validateUpdate };
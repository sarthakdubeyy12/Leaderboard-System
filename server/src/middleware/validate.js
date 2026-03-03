/* 
act as a middleware for validating incoming request
it checks if the user_id is a string and if the delta is a number. 
*/

function validateUpdate(req, res, next) {
  const { user_id, delta } = req.body;

  //validate for user id
  if (!user_id || typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  //validate for delta
  if (typeof delta !== "number") {
    return res.status(400).json({ error: "Delta must be a number" });
  }
  next();
}
module.exports = { validateUpdate };
require("dotenv").config();
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
if (!process.env.JWT_SECRET) {
  console.warn("[auth] WARNING: JWT_SECRET is not set — using an insecure development secret.");
}

/** Sign a token for a user row. */
const signToken = (user) =>
  jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

/** Require any valid Bearer token. Populates req.user = { sub, username, role }. */
function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });
  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Require a valid token AND the OWNER or STAFF role. */
function staffRequired(req, res, next) {
  return authRequired(req, res, () => {
    if (!["OWNER", "STAFF"].includes(req.user.role)) {
      return res.status(403).json({ error: "Staff access required" });
    }
    return next();
  });
}

module.exports = { signToken, authRequired, staffRequired };

const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../db");
const { signToken, authRequired } = require("../middleware/auth");

const router = Router();

/** Public user shape — never expose the password hash. */
const pub = (u) => ({ id: u.id, username: u.username, name: u.name, role: u.role });

/**
 * POST /api/auth/signup
 * body: { username, password, name?, staffKey? }
 * → 201 { token, user } | 400 | 409
 * A STAFF account can only be created when staffKey matches STAFF_KEY.
 */
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password, name, staffKey } = req.body || {};
    const uname = String(username || "").trim().toLowerCase();
    if (uname.length < 3 || uname.length > 32 || !/^[a-z0-9_.-]+$/.test(uname)) {
      return res.status(400).json({ error: "username must be 3–32 chars (letters, numbers, . _ -)" });
    }
    if (!password || String(password).length < 6 || String(password).length > 128) {
      return res.status(400).json({ error: "password must be 6–128 characters" });
    }
    const exists = await prisma.user.findUnique({ where: { username: uname } });
    if (exists) return res.status(409).json({ error: "username is already taken" });

    const role =
      staffKey && process.env.STAFF_KEY && staffKey === process.env.STAFF_KEY ? "STAFF" : "STUDENT";

    const user = await prisma.user.create({
      data: {
        username: uname,
        passwordHash: await bcrypt.hash(String(password), 10),
        name: String(name || uname).trim().slice(0, 60),
        role,
      },
    });
    return res.status(201).json({ token: signToken(user), user: pub(user) });
  } catch (e) {
    return next(e);
  }
});

/**
 * POST /api/auth/login
 * body: { username, password } → { token, user } | 401
 */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }
    const user = await prisma.user.findUnique({
      where: { username: String(username).trim().toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    return res.json({ token: signToken(user), user: pub(user) });
  } catch (e) {
    return next(e);
  }
});

/**
 * GET /api/auth/me  (Bearer token) → { user }
 */
router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: "User no longer exists" });
    return res.json({ user: pub(user) });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

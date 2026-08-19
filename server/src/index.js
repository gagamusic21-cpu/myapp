require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { prisma, serialize } = require("./db");
const authRoutes = require("./routes/auth.routes");
const contentRoutes = require("./routes/content.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();
app.disable("x-powered-by");

/* ---------------- CORS: only the configured frontend origins ---------------- */
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // no origin = same-server / tooling (curl, health checks) — allow
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} is not allowed`));
    },
  })
);

app.use(express.json({ limit: "12mb" })); // base64 photos / attached files

/* ---------------- public meta routes ---------------- */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "huec-api", time: new Date().toISOString() });
});

app.get("/api/stats", async (_req, res, next) => {
  try {
    const [exams, docs, photos, courses, users] = await Promise.all([
      prisma.exam.count(),
      prisma.document.count(),
      prisma.photo.count(),
      prisma.course.count(),
      prisma.user.count(),
    ]);
    res.json({ exams, docs, photos, courses, users });
  } catch (e) {
    next(e);
  }
});

/** Full public read of all published content (the frontend hydrates from this). */
app.get("/api/snapshot", async (_req, res, next) => {
  try {
    const [exams, courses, documents, photos, announcements, ads] = await Promise.all([
      prisma.exam.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.course.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.document.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.ad.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    res.json(serialize({ exams, courses, documents, photos, announcements, ads }));
  } catch (e) {
    next(e);
  }
});

/* ---------------- feature routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api", contentRoutes); // /api/exams, /api/courses, /api/documents, /api/photos, /api/announcements, /api/ads
app.use("/api/chat", chatRoutes);

/* ---------------- 404 + error handler ---------------- */
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✔ huec-api listening on :${PORT}`);
  console.log(`  health  → GET  /api/health`);
  console.log(`  CORS    → ${allowedOrigins.join(", ")}`);
});

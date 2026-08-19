const { Router } = require("express");
const { prisma, serialize } = require("../db");
const { staffRequired } = require("../middleware/auth");

const router = Router();

const str = (v, max) => (v == null ? "" : String(v).slice(0, max));
const int = (v, fallback, max = 10000) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : fallback;
};

/**
 * Factory: POST /api/:path (staff) to create, DELETE /api/:path/:id (staff) to remove.
 * `shape(body)` whitelists + validates fields; returning null → 400.
 */
function crud(path, model, shape) {
  router.post(path, staffRequired, async (req, res, next) => {
    try {
      const data = shape(req.body || {});
      if (!data) return res.status(400).json({ error: `Invalid payload for ${path}` });
      const row = await prisma[model].create({ data });
      return res.status(201).json(serialize(row));
    } catch (e) {
      return next(e);
    }
  });

  router.delete(`${path}/:id`, staffRequired, async (req, res, next) => {
    try {
      await prisma[model].delete({ where: { id: str(req.params.id, 60) } });
      return res.status(204).end();
    } catch (e) {
      // record already gone → treat as success (idempotent delete)
      if (e.code === "P2025") return res.status(204).end();
      return next(e);
    }
  });
}

/* ---------------- exams ---------------- */
crud("/exams", "exam", (b) => {
  if (!b.entityId || !b.title) return null;
  const questions = Array.isArray(b.questions) ? b.questions.slice(0, 200) : [];
  return {
    entityId: str(b.entityId, 80),
    title: str(b.title, 220),
    course: str(b.course, 120) || str(b.title, 120),
    courseCode: str(b.courseCode, 40) || "—",
    type: str(b.type, 30) || "Final",
    year: str(b.year, 24),
    gYear: str(b.gYear, 24),
    semester: b.semester === "I" ? "I" : "II",
    duration: str(b.duration, 30) || "3 hrs",
    marks: int(b.marks, 50, 500),
    hasAnswers: !!b.hasAnswers,
    questions,
  };
});

/* ---------------- courses ---------------- */
crud("/courses", "course", (b) => {
  if (!b.entityId || !b.title || !b.code) return null;
  return {
    entityId: str(b.entityId, 80),
    code: str(b.code, 40),
    title: str(b.title, 160),
    credits: int(b.credits, 3, 12),
    semester: str(b.semester, 12) || "I",
    level: str(b.level, 40) || "Year I",
    description: str(b.description, 1000),
    topics: Array.isArray(b.topics) ? b.topics.slice(0, 40).map((t) => str(t, 80)) : [],
  };
});

/* ---------------- documents / notes / PDFs / materials ---------------- */
crud("/documents", "document", (b) => {
  if (!b.entityId || !b.title) return null;
  const fileData = b.fileData ? str(b.fileData, 8_000_000) : null; // ~6 MB file cap in base64
  return {
    entityId: str(b.entityId, 80),
    title: str(b.title, 220),
    kind: ["Document", "Note", "PDF", "Material", "Syllabus"].includes(b.kind) ? b.kind : "Document",
    course: str(b.course, 120),
    pages: int(b.pages, 1, 5000),
    size: str(b.size, 20) || "—",
    updated: str(b.updated, 30) || new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    fileName: b.fileName ? str(b.fileName, 200) : null,
    fileData,
  };
});

/* ---------------- photos (exam shots, answer sheets) ---------------- */
crud("/photos", "photo", (b) => {
  if (!b.entityId || !b.src) return null;
  if (String(b.src).length > 4_000_000) return null; // ~3 MB image cap after client downscale
  return {
    entityId: str(b.entityId, 80),
    src: String(b.src),
    caption: str(b.caption, 220) || "Untitled photo",
    tag: str(b.tag, 60) || "Photo",
  };
});

/* ---------------- announcements ---------------- */
crud("/announcements", "announcement", (b) => {
  if (!b.title || !b.body) return null;
  return {
    date: str(b.date, 30) || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    title: str(b.title, 140),
    body: str(b.body, 600),
    tag: str(b.tag, 30) || "System",
  };
});

/* ---------------- advertisements ---------------- */
crud("/ads", "ad", (b) => {
  if (!b.title) return null;
  return {
    eyebrow: str(b.eyebrow, 80) || "Sponsored",
    title: str(b.title, 120),
    body: str(b.body, 300),
    cta: str(b.cta, 40) || "Learn more",
    link: str(b.link, 500) || "#",
    offer: b.offer ? str(b.offer, 60) : null,
    image: b.image ? str(b.image, 4_000_000) : null,
    tone: ["pine", "gold", "night"].includes(b.tone) ? b.tone : "pine",
  };
});

module.exports = router;

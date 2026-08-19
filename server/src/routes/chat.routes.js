const { Router } = require("express");
const { prisma, serialize } = require("../db");
const { staffRequired } = require("../middleware/auth");

const router = Router();

/**
 * POST /api/chat/message/:id/report  (public) — flag a message for moderators
 * Must be registered before POST /:room so Express matches it first.
 */
router.post("/message/:id/report", async (req, res, next) => {
  try {
    await prisma.chatMessage.update({ where: { id: String(req.params.id).slice(0, 60) }, data: { reported: true } });
    return res.status(204).end();
  } catch (e) {
    if (e.code === "P2025") return res.status(204).end();
    return next(e);
  }
});

/** DELETE /api/chat/:id (staff) — moderation removal */
router.delete("/:id", staffRequired, async (req, res, next) => {
  try {
    await prisma.chatMessage.delete({ where: { id: String(req.params.id).slice(0, 60) } });
    return res.status(204).end();
  } catch (e) {
    if (e.code === "P2025") return res.status(204).end();
    return next(e);
  }
});

/** GET /api/chat/:room — latest messages for a room (public read) */
router.get("/:room", async (req, res, next) => {
  try {
    const room = String(req.params.room).slice(0, 80);
    const msgs = await prisma.chatMessage.findMany({
      where: { room },
      orderBy: { time: "asc" },
      take: 200,
    });
    return res.json(serialize(msgs));
  } catch (e) {
    return next(e);
  }
});

/**
 * POST /api/chat/:room
 * body: { id?, author, text, time?, replyTo? } → created message
 */
router.post("/:room", async (req, res, next) => {
  try {
    const room = String(req.params.room).slice(0, 80);
    const { id, author, text, time, replyTo } = req.body || {};
    const cleanAuthor = String(author || "").trim().slice(0, 40);
    const cleanText = String(text || "").trim().slice(0, 600);
    if (!cleanAuthor) return res.status(400).json({ error: "author is required" });
    if (!cleanText) return res.status(400).json({ error: "message text is required" });

    const msg = await prisma.chatMessage.create({
      data: {
        ...(id && /^[a-z0-9-]{4,64}$/i.test(String(id)) ? { id: String(id) } : {}),
        room,
        author: cleanAuthor,
        text: cleanText,
        time: BigInt(time && Number.isFinite(Number(time)) ? Number(time) : Date.now()),
        replyTo:
          replyTo && typeof replyTo === "object"
            ? { author: String(replyTo.author || "").slice(0, 40), text: String(replyTo.text || "").slice(0, 200) }
            : undefined,
      },
    });
    return res.status(201).json(serialize(msg));
  } catch (e) {
    // duplicate client-generated id → treat as already delivered
    if (e.code === "P2002") return res.status(204).end();
    return next(e);
  }
});

module.exports = router;

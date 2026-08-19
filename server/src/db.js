require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["warn", "error"],
});

/** BigInt-safe JSON serializer (ChatMessage.time is stored as BigInt). */
const serialize = (value) =>
  JSON.parse(JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? Number(v) : v)));

module.exports = { prisma, serialize };

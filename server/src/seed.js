/**
 * Seeds the default staff account so you can log in immediately after deploy.
 *
 *   npm run seed
 *
 * Defaults: username "admin", password "staff123", role OWNER.
 * Override with SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD in .env
 * (change them in production!).
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { prisma } = require("./db");

(async () => {
  const username = (process.env.SEED_ADMIN_USERNAME || "admin").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "staff123";

  const user = await prisma.user.upsert({
    where: { username },
    update: {}, // never overwrite an existing account's password
    create: {
      username,
      passwordHash: await bcrypt.hash(password, 10),
      name: "Site Administrator",
      role: "OWNER",
    },
  });

  console.log("✔ Staff account ready");
  console.log(`    username : ${user.username}`);
  console.log(`    password : ${password}`);
  console.log(`    role     : ${user.role}`);
  console.log("  → Log in from the Staff dashboard on the website.");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error("✘ Seed failed:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});

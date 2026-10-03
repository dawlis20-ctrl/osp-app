import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const vehicles = [
  { name: "GBA 2,3/16 Mercedes-Benz", label: "GBA", plate: "328K15" },
  { name: "GCBA 5/24 Jelcz", label: "GCBA", plate: "328K85" },
  { name: "SLRR Ford", label: "SLRR", plate: "327K88" },
];

async function seedVehicles() {
  for (const vehicle of vehicles) {
    const existing = await prisma.vehicle.findFirst({ where: { plate: vehicle.plate } });
    if (!existing) await prisma.vehicle.create({ data: vehicle });
  }
}

// Production: SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD are set in .env on the server.
// Creates only that one administrator (plus the vehicles) — no demo accounts with known passwords.
async function seedProduction(email: string, password: string) {
  if (password.length < 10) throw new Error("SEED_ADMIN_PASSWORD musi mieć co najmniej 10 znaków.");

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: {
      name: process.env.SEED_ADMIN_NAME || "Administrator",
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });
  await seedVehicles();
  console.log(`Zasiano bazę produkcyjną. Administrator: ${email}`);
  console.log("Usuń SEED_ADMIN_PASSWORD z pliku .env i zmień hasło po pierwszym logowaniu.");
}

// Local development only: demo accounts with well-known passwords.
async function seedDemo() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@osp.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@osp.local",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "naczelnik@osp.local" },
    update: {},
    create: {
      name: "Jan Naczelnik",
      email: "naczelnik@osp.local",
      passwordHash: await bcrypt.hash("naczelnik123", 10),
      role: "NACZELNIK",
    },
  });

  const druhowie = [
    "Adam Kowalski",
    "Piotr Nowak",
    "Marek Wiśniewski",
    "Tomasz Wójcik",
    "Krzysztof Kamiński",
    "Michał Lewandowski",
  ];

  for (const [i, name] of druhowie.entries()) {
    const email = `druh${i + 1}@osp.local`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: { name, email, passwordHash: await bcrypt.hash("druh123", 10), role: "DRUH" },
      });
    }
  }

  await seedVehicles();

  console.log("Zasiano bazę (DEMO — tylko do rozwoju lokalnego).");
  console.log("  administrator:", admin.email, "/ admin123");
  console.log("  naczelnik:     naczelnik@osp.local / naczelnik123");
  console.log("  druhowie:      druh1@osp.local ... druh6@osp.local / druh123");
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) await seedProduction(email, password);
  else await seedDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

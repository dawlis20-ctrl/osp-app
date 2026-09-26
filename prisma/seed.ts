import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@osp.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@osp.local",
      passwordHash,
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
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash("druh123", 10),
          role: "DRUH",
        },
      });
    }
  }

  const vehicles = [
    { name: "GBA 2,3/16 Mercedes-Benz", label: "GBA", plate: "328K15" },
    { name: "GCBA 5/24 Jelcz", label: "GCBA", plate: "328K85" },
    { name: "SLRR Ford", label: "SLRR", plate: "327K88" },
  ];

  for (const vehicle of vehicles) {
    const existing = await prisma.vehicle.findFirst({ where: { plate: vehicle.plate } });
    if (!existing) {
      await prisma.vehicle.create({ data: vehicle });
    }
  }

  console.log("Zasiano bazę.");
  console.log("  administrator:", admin.email, "/ admin123");
  console.log("  naczelnik:     naczelnik@osp.local / naczelnik123");
  console.log("  druhowie:      druh1@osp.local ... druh6@osp.local / druh123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

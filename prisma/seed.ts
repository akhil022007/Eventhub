import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Login compares against a bcrypt hash, so the seeded password must be hashed.
  const password = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Akhil",
      email: "akhil@test.com",
      password,
      role: "ADMIN",
    },
  });

  // The creator is the event's organizer.
  await prisma.event.create({
    data: {
      title: "Photography Workshop",
      description: "Campus photography event",
      creatorId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "ORGANIZER",
        },
      },
    },
  });

  console.log("Seeded successfully (login: akhil@test.com / 123456)");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

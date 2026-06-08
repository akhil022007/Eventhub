import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Akhil",
      email: "akhil@test.com",
      password: "123456",
      role: "ADMIN",
    },
  });

  await prisma.event.create({
    data: {
      title: "Photography Workshop",
      description: "Campus photography event",
      creatorId: user.id,
    },
  });

  console.log("Seeded successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
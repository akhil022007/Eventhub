import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const userId =
    (await cookies()).get(
      "userId"
    )?.value;

  if (!userId) {
    return NextResponse.json(
      null
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

  return NextResponse.json(user);
}
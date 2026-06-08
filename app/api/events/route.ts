import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch events",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      title,
      description,
    } = body;

    const user =
      await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        {
          message: "No user found",
        },
        {
          status: 400,
        }
      );
    }

    const event =
      await prisma.event.create({
        data: {
          title,
          description,
          creatorId: user.id,
        },
      });

    return NextResponse.json(
      event,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
         error:
        error instanceof Error
          ? error.message
          : String(error),
      },
      {
        status: 500,
      }
    );
  }
}
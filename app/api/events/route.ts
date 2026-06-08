import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Admins see every event; everyone else sees events they created
    // or have been added to as a member (viewer/organizer).
    const events = await prisma.event.findMany({
      where: isAdmin(user)
        ? undefined
        : {
            OR: [
              { creatorId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
      // Include the caller's own membership so the client can tell whether
      // they organize the event (and may upload to it).
      include: {
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
    } = body;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // The creator owns the event and is its organizer.
    const event = await prisma.event.create({
      data: {
        title,
        description,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "ORGANIZER",
          },
        },
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

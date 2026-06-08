import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, accessibleEventsWhere } from "@/lib/auth";
import { json, badRequest, unauthorized, serverError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const events = await prisma.event.findMany({
      where: accessibleEventsWhere(user),
      // Include the caller's own membership so the client can tell whether
      // they organize/upload to the event.
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

    return json(events);
  } catch (error) {
    return serverError("Failed to fetch events", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const { title, description } = await req.json();

    if (!title) {
      return badRequest("Title is required");
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

    return json(event, 201);
  } catch (error) {
    return serverError("Failed to create event", error);
  }
}

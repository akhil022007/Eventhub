import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageEvent } from "@/lib/auth";
import {
  json,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
    userId: string;
  }>;
};

// Change a member's role (promote to UPLOADER / demote to VIEWER).
export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id, userId } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!(await canManageEvent(user, id))) return forbidden();

    const { role } = await req.json();

    // The organizer can only assign UPLOADER or VIEWER; the ORGANIZER role
    // belongs to the creator alone.
    if (role !== "UPLOADER" && role !== "VIEWER") {
      return badRequest("Invalid role");
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!event) {
      return notFound("Event not found");
    }

    if (event.creatorId === userId) {
      return badRequest("The event creator's role cannot be changed");
    }

    const membership = await prisma.eventMember.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    });

    if (!membership) {
      return notFound("Member not found");
    }

    const updated = await prisma.eventMember.update({
      where: { id: membership.id },
      data: { role },
    });

    return json(updated);
  } catch (error) {
    return serverError("Failed to update member", error);
  }
}

// Remove a member from the event.
export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id, userId } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!(await canManageEvent(user, id))) return forbidden();

    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!event) {
      return notFound("Event not found");
    }

    if (event.creatorId === userId) {
      return badRequest("The event creator cannot be removed");
    }

    const membership = await prisma.eventMember.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    });

    if (!membership) {
      return notFound("Member not found");
    }

    await prisma.eventMember.delete({
      where: { id: membership.id },
    });

    return json({ message: "Member removed" });
  } catch (error) {
    return serverError("Failed to remove member", error);
  }
}

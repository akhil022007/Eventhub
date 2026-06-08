import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageEvent } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
    userId: string;
  }>;
};

// Change a member's role (promote to ORGANIZER / demote to VIEWER).
export async function PATCH(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id, userId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!(await canManageEvent(user, id))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { role } = await req.json();

    // The organizer can only assign the UPLOADER or VIEWER roles; the
    // ORGANIZER role belongs to the creator alone.
    if (role !== "UPLOADER" && role !== "VIEWER") {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // The creator's organizer status is permanent and can't be changed.
    if (event.creatorId === userId) {
      return NextResponse.json(
        { message: "The event creator's role cannot be changed" },
        { status: 400 }
      );
    }

    const membership = await prisma.eventMember.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.eventMember.update({
      where: { id: membership.id },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update member" },
      { status: 500 }
    );
  }
}

// Remove a member from the event.
export async function DELETE(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id, userId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!(await canManageEvent(user, id))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // The creator can't be removed from their own event.
    if (event.creatorId === userId) {
      return NextResponse.json(
        { message: "The event creator cannot be removed" },
        { status: 400 }
      );
    }

    const membership = await prisma.eventMember.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    await prisma.eventMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to remove member" },
      { status: 500 }
    );
  }
}

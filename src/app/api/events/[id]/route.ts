import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageEvent } from "@/lib/auth";
import { json, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!(await canManageEvent(user, id))) return forbidden();

    const event = await prisma.event.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!event) {
      return notFound("Event not found");
    }

    for (const media of event.media) {
      if (!media.fileName) continue;
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        media.fileName
      );

      try {
        await fs.unlink(filePath);
      } catch {}
    }

    // Remove dependent rows before the event itself to satisfy FKs.
    await prisma.comment.deleteMany({ where: { media: { eventId: id } } });
    await prisma.like.deleteMany({ where: { media: { eventId: id } } });
    await prisma.tag.deleteMany({ where: { media: { eventId: id } } });
    await prisma.media.deleteMany({ where: { eventId: id } });
    await prisma.eventMember.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });

    return json({ message: "Event deleted" });
  } catch (error) {
    return serverError("Failed to delete event", error);
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!(await canManageEvent(user, id))) return forbidden();

    const { title, description } = await req.json();

    const event = await prisma.event.update({
      where: { id },
      data: { title, description },
    });

    return json(event);
  } catch (error) {
    return serverError("Failed to update event", error);
  }
}

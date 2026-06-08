import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewEvent } from "@/lib/auth";
import { json, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const media = await prisma.media.findUnique({
      where: { id },
      select: { eventId: true },
    });

    if (!media) {
      return notFound("Media not found");
    }

    // Must be a member of the event (organizer/uploader/viewer) to like.
    if (!(await canViewEvent(user, media.eventId))) {
      return forbidden();
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_mediaId: { userId: user.id, mediaId: id },
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return json({ liked: false });
    }

    await prisma.like.create({
      data: { userId: user.id, mediaId: id },
    });

    return json({ liked: true });
  } catch (error) {
    return serverError("Failed to like media", error);
  }
}

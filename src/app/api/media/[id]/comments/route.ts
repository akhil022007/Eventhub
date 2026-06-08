import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewEvent } from "@/lib/auth";
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
  }>;
};

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { content } = await req.json();

    if (!content || !content.trim()) {
      return badRequest("Comment cannot be empty");
    }

    const media = await prisma.media.findUnique({
      where: { id },
      select: { eventId: true },
    });

    if (!media) {
      return notFound("Media not found");
    }

    // Must be a member of the event (organizer/uploader/viewer) to comment.
    if (!(await canViewEvent(user, media.eventId))) {
      return forbidden();
    }

    const comment = await prisma.comment.create({
      data: { content, userId: user.id, mediaId: id },
    });

    return json(comment, 201);
  } catch (error) {
    return serverError("Failed to create comment", error);
  }
}

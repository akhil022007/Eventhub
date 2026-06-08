import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewEvent } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content } =
      await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const media = await prisma.media.findUnique({
      where: { id },
      select: { eventId: true },
    });

    if (!media) {
      return NextResponse.json(
        { message: "Media not found" },
        { status: 404 }
      );
    }

    // Must be a member of the event (organizer or viewer) to comment.
    if (!(await canViewEvent(user, media.eventId))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const comment =
      await prisma.comment.create({
        data: {
          content,
          userId: user.id,
          mediaId: id,
        },
      });

    return NextResponse.json(
      comment,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to create comment",
      },
      {
        status: 500,
      }
    );
  }
}

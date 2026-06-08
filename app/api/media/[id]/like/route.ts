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

    // Must be a member of the event (organizer or viewer) to like its media.
    if (!(await canViewEvent(user, media.eventId))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const existingLike =
      await prisma.like.findUnique({
        where: {
          userId_mediaId: {
            userId: user.id,
            mediaId: id,
          },
        },
      });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({
        liked: false,
      });
    }

    await prisma.like.create({
      data: {
        userId: user.id,
        mediaId: id,
      },
    });

    return NextResponse.json({
      liked: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to like media",
      },
      {
        status: 500,
      }
    );
  }
}

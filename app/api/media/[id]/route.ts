import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageEvent } from "@/lib/auth";

import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
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

    const media =
      await prisma.media.findUnique({
        where: {
          id,
        },
      });

    if (!media) {
      return NextResponse.json(
        {
          message: "Media not found",
        },
        {
          status: 404,
        }
      );
    }

    // Only the organizer of the media's event (or an admin) may delete it.
    if (!(await canManageEvent(user, media.eventId))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      media.url
    );

    try {
      await fs.unlink(filePath);
    } catch {
      console.log(
        "File already missing"
      );
    }

    // Clear dependent rows first to satisfy foreign keys.
    await prisma.comment.deleteMany({ where: { mediaId: id } });
    await prisma.like.deleteMany({ where: { mediaId: id } });
    await prisma.tag.deleteMany({ where: { mediaId: id } });

    await prisma.media.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Deleted",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to delete media",
      },
      {
        status: 500,
      }
    );
  }
}

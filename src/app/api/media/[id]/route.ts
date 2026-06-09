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

    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return notFound("Media not found");
    }

    // Only the organizer of the media's event (or an admin) may delete it.
    if (!(await canManageEvent(user, media.eventId))) {
      return forbidden();
    }

    if (media.fileName) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        media.fileName
      );

      try {
        await fs.unlink(filePath);
      } catch {
        console.log("File already missing");
      }
    }

    // Clear dependent rows first to satisfy foreign keys.
    await prisma.comment.deleteMany({ where: { mediaId: id } });
    await prisma.like.deleteMany({ where: { mediaId: id } });
    await prisma.tag.deleteMany({ where: { mediaId: id } });
    await prisma.media.delete({ where: { id } });

    return json({ message: "Deleted" });
  } catch (error) {
    return serverError("Failed to delete media", error);
  }
}

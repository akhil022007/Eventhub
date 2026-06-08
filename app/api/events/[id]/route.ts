import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const event = await prisma.event.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    for (const media of event.media) {
      const filePath = path.join(
        process.cwd(),
        "public",
        media.url
      );

      try {
        await fs.unlink(filePath);
      } catch {}
    }

    await prisma.media.deleteMany({
      where: {
        eventId: id,
      },
    });

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Event deleted",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to delete event",
      },
      {
        status: 500,
      }
    );
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const {
      title,
      description,
    } = body;

    const event =
      await prisma.event.update({
        where: {
          id,
        },
        data: {
          title,
          description,
        },
      });

    return NextResponse.json(
      event
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update event",
      },
      {
        status: 500,
      }
    );
  }
}
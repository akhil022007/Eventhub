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
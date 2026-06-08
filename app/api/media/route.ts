import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canUploadToEvent } from "@/lib/auth";

import fs from "fs/promises";
import path from "path";

import { v4 as uuid } from "uuid";

import { generateTags } from "@/services/ai-tags";

export async function POST(
  req: NextRequest
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData =
      await req.formData();

    const file = formData.get(
      "file"
    ) as File | null;

    const eventId = formData.get(
      "eventId"
    ) as string | null;

    if (!file || !eventId) {
      return NextResponse.json(
        {
          message:
            "File and eventId are required",
        },
        {
          status: 400,
        }
      );
    }

    // Organizers and members promoted to UPLOADER may upload media.
    if (!(await canUploadToEvent(user, eventId))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Unsupported file type",
        },
        {
          status: 400,
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const extension =
      file.name.split(".").pop();

    const fileName = `${uuid()}.${extension}`;

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      fileName
    );

    await fs.writeFile(
      uploadPath,
      buffer
    );

    const media =
      await prisma.media.create({
        data: {
          fileName,
          originalName:
            file.name,
          url: `/uploads/${fileName}`,
          fileType:
            file.type,
          eventId,
        },
      });

    const tags =
      await generateTags(
        file.name
      );

    if (tags.length > 0) {
      await prisma.tag.createMany({
        data: tags.map(
          (tag) => ({
            name: tag,
            mediaId: media.id,
          })
        ),
      });
    }

    const mediaWithTags =
      await prisma.media.findUnique({
        where: {
          id: media.id,
        },
        include: {
          tags: true,
        },
      });

    return NextResponse.json(
      mediaWithTags,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to upload media",
      },
      {
        status: 500,
      }
    );
  }
}
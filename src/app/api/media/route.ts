import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canUploadToEvent } from "@/lib/auth";
import { json, badRequest, unauthorized, forbidden, serverError } from "@/lib/api";

import fs from "fs/promises";
import path from "path";

import { generateTags } from "@/services/auto-tags";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string | null;

    if (!file || !eventId) {
      return badRequest("File and eventId are required");
    }

    // Organizers and members promoted to UPLOADER may upload media.
    if (!(await canUploadToEvent(user, eventId))) {
      return forbidden();
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest("Unsupported file type");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;

    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(uploadPath, buffer);

    const media = await prisma.media.create({
      data: {
        fileName,
        originalName: file.name,
        // Served by the uploads route handler (works at runtime in production).
        url: `/api/uploads/${fileName}`,
        fileType: file.type,
        eventId,
      },
    });

    // Tags the user chose/typed during upload, normalized.
    const userTags = formData
      .getAll("tags")
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean);

    // Plus tags auto-derived from the filename.
    const autoTags = await generateTags(file.name);

    // Union, deduped, with light limits to avoid abuse.
    const tags = Array.from(
      new Set([...userTags, ...autoTags.map((t) => t.toLowerCase())])
    )
      .filter((t) => t.length <= 30)
      .slice(0, 20);

    if (tags.length > 0) {
      await prisma.tag.createMany({
        data: tags.map((tag) => ({ name: tag, mediaId: media.id })),
      });
    }

    const mediaWithTags = await prisma.media.findUnique({
      where: { id: media.id },
      include: { tags: true },
    });

    return json(mediaWithTags, 201);
  } catch (error) {
    return serverError("Failed to upload media", error);
  }
}

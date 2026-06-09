import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Serves uploaded media from disk at request time. Next.js only serves files
// that were in /public when the server started, so runtime uploads must be
// streamed through a route handler instead.

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

type Props = {
  params: Promise<{ name: string }>;
};

export async function GET(_req: NextRequest, { params }: Props) {
  const { name } = await params;

  // Reject anything that isn't a plain filename (no path traversal).
  const safeName = path.basename(name);
  if (safeName !== name) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(safeName).toLowerCase()];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, safeName));

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

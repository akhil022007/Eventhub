import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageEvent } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
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

    if (!(await canManageEvent(user, id))) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { imageUrl } = body;

    const event =
      await prisma.event.update({
        where: {
          id,
        },
        data: {
          coverImage: imageUrl,
        },
      });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to update cover image",
      },
      {
        status: 500,
      }
    );
  }
}

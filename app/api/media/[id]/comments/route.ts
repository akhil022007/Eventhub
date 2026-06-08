import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const { content } =
      await req.json();

    const user =
      await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 400,
        }
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
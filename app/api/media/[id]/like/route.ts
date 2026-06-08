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
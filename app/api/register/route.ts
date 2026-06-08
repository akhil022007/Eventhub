import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
    } = body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "Email already exists",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password:
            hashedPassword,
        },
      });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to register",
      },
      {
        status: 500,
      }
    );
  }
}
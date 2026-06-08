import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      email,
      password,
    } = body;

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const isValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isValid) {
      return NextResponse.json(
        {
          message:
            "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const response =
      NextResponse.json({
        message:
          "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    response.cookies.set(
      "userId",
      user.id,
      {
        httpOnly: true,
        path: "/",
        maxAge:
          60 * 60 * 24 * 7,
      }
    );
    response.cookies.set(
  "role",
  user.role,
  {
    httpOnly: true,
    path: "/",
    maxAge:
      60 * 60 * 24 * 7,
  }
);

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}
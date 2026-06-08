import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signSession } from "@/lib/session";
import { unauthorized, serverError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return unauthorized("Invalid credentials");
    }

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Store an HMAC-signed token, not the raw id, so the cookie can't be
    // forged to impersonate another user. Role is always read from the DB.
    const token = await signSession(user.id);

    response.cookies.set("userId", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return serverError("Login failed", error);
  }
}

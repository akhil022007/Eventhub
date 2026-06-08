import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageEvent } from "@/lib/auth";
import { json, unauthorized, forbidden, serverError } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!(await canManageEvent(user, id))) return forbidden();

    const { imageUrl } = await req.json();

    const event = await prisma.event.update({
      where: { id },
      data: { coverImage: imageUrl },
    });

    return json(event);
  } catch (error) {
    return serverError("Failed to update cover image", error);
  }
}

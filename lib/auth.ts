import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

/**
 * Reads the logged-in user from the signed `userId` cookie.
 * The cookie value is HMAC-verified before use, so a forged or tampered
 * cookie resolves to null. Returns null when there is no valid session or
 * the user no longer exists. Works in both Server Components and Route Handlers.
 */
export async function getCurrentUser() {
  const token = (await cookies()).get("userId")?.value;

  const userId = await verifySession(token);

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

type MaybeUser = Awaited<ReturnType<typeof getCurrentUser>>;

export function isAdmin(user: MaybeUser) {
  return user?.role === "ADMIN";
}

/**
 * Prisma `where` filter for the events a user may see: admins see all,
 * everyone else sees events they created or are a member of. A null user
 * matches nothing. Shared by the events list, events API, and dashboard.
 */
export function accessibleEventsWhere(
  user: MaybeUser
): Prisma.EventWhereInput {
  if (!user) return { id: { in: [] } };
  if (isAdmin(user)) return {};

  return {
    OR: [
      { creatorId: user.id },
      { members: { some: { userId: user.id } } },
    ],
  };
}

/**
 * The membership record for a user on an event (organizer or viewer),
 * or null if they have not joined.
 */
export async function getMembership(userId: string, eventId: string) {
  return prisma.eventMember.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });
}

/**
 * Can this user see the event's gallery and interact (like/comment)?
 * True for admins, the creator, and any member (organizer or viewer).
 */
export async function canViewEvent(user: MaybeUser, eventId: string) {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true },
  });

  if (!event) return false;
  if (event.creatorId === user.id) return true;

  return Boolean(await getMembership(user.id, eventId));
}

/**
 * Can this user manage the event — edit/delete it, set the cover, delete
 * media, and manage members/invites? Reserved for the organizer: admins and
 * the event's creator.
 */
export async function canManageEvent(user: MaybeUser, eventId: string) {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true },
  });

  return Boolean(event && event.creatorId === user.id);
}

/**
 * Can this user upload media to the event? True for organizers (manage) and
 * for members the organizer has promoted to UPLOADER.
 */
export async function canUploadToEvent(user: MaybeUser, eventId: string) {
  if (!user) return false;
  if (await canManageEvent(user, eventId)) return true;

  const membership = await getMembership(user.id, eventId);

  return membership?.role === "UPLOADER";
}

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

/**
 * Reads the logged-in user from the httpOnly `userId` cookie.
 * Returns null when there is no cookie or the user no longer exists.
 * Works in both Server Components and Route Handlers.
 */
export async function getCurrentUser() {
  const userId = (await cookies()).get("userId")?.value;

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

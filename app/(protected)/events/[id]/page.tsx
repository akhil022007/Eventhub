import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewEvent, canManageEvent } from "@/lib/auth";
import EventGallery from "@/components/gallery/EventGallery";
import InviteLink from "@/components/events/InviteLink";
import MembersPanel from "@/components/events/MembersPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      media: {
        include: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!event) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Event Not Found
        </h1>
      </main>
    );
  }

  // Only members (organizer/viewer) and admins can see an event's gallery.
  if (!(await canViewEvent(user, event.id))) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">You don&apos;t have access</h1>
          <p className="text-muted-foreground">
            Ask the organizer for an invite link to join this event.
          </p>
          <Link href="/events">
            <Button className="w-full">Back to Events</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const canManage = await canManageEvent(user, event.id);

  // Organizers see who has access; load the member list for them.
  const memberRows = canManage
    ? await prisma.eventMember.findMany({
        where: { eventId: event.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const members = memberRows.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    isCreator: m.userId === event.creatorId,
  }));

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {event.title}
        </h1>

        <p className="text-muted-foreground mt-2">
          {event.description || "No description"}
        </p>

        <p className="mt-2">
          {event.media.length} Files
        </p>
      </div>

      {canManage && (
        <div className="mb-8 space-y-6">
          <InviteLink
            eventId={event.id}
            inviteToken={event.inviteToken}
          />

          <MembersPanel eventId={event.id} members={members} />
        </div>
      )}

      <EventGallery
        media={event.media}
        canManage={canManage}
        currentUserId={user?.id}
      />
    </main>
  );
}

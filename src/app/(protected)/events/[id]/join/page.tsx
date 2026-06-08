import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getMembership } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function JoinEventPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { token } = await searchParams;

  // Proxy guarantees a logged-in user before this page renders.
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/events/${id}/join?token=${token ?? ""}`
      )}`
    );
  }

  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, title: true, inviteToken: true, creatorId: true },
  });

  // An invalid id or a token that doesn't match means no access.
  if (!event || !token || token !== event.inviteToken) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid invite link</h1>
          <p className="text-muted-foreground">
            This invite link is broken or has expired. Ask the organizer for a
            fresh link.
          </p>
          <Link href="/events">
            <Button className="w-full">Back to Events</Button>
          </Link>
        </Card>
      </main>
    );
  }

  // The creator is already the organizer; everyone else joins as a viewer.
  if (event.creatorId !== user.id) {
    const existing = await getMembership(user.id, event.id);

    if (!existing) {
      await prisma.eventMember.create({
        data: {
          userId: user.id,
          eventId: event.id,
          role: "VIEWER",
        },
      });
    }
  }

  redirect(`/events/${event.id}`);
}

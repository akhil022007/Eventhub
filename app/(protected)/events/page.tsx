import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, accessibleEventsWhere } from "@/lib/auth";

import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage() {
  const user = await getCurrentUser();

  // Admins see every event; everyone else sees events they created
  // or joined as a member.
  const events = await prisma.event.findMany({
    where: accessibleEventsWhere(user),
    include: {
      _count: { select: { media: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-8 py-8">

      <div
        className="
          flex
          items-center
          justify-between
          mb-10
        "
      >
        <h1
          className="
            text-5xl
            font-bold
          "
        >
          Events
        </h1>

        <Link href="/events/create">
          <Button
            className="
              px-6
              py-6
            "
          >
            Create Event
          </Button>
        </Link>
      </div>

      <EventsClient
        events={events}
      />
    </main>
  );
}
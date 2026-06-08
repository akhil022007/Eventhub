import EventCard from "./EventCard";
import type { EventPreview } from "@/lib/types";

type Props = {
  events: EventPreview[];
};

export default function EventGrid({
  events,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          title={event.title}
          coverImage={event.coverImage}
          photos={event._count?.media ?? 0}
        />
      ))}
    </div>
  );
}
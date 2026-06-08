import EventCard from "./EventCard";

type EventType = {
  id: string;
  title: string;
  coverImage?: string | null;
};

type Props = {
  events: EventType[];
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
        />
      ))}
    </div>
  );
}
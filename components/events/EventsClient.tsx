"use client";

import { useState } from "react";

import EventGrid from "./EventGrid";

type EventType = {
  id: string;
  title: string;
  coverImage?: string | null;
};

type Props = {
  events: EventType[];
};

export default function EventsClient({
  events,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filteredEvents =
    events.filter((event) =>
      event.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
          w-full
          p-3
          rounded-lg
          border
          mb-8
          bg-background
        "
      />

      <EventGrid
        events={filteredEvents}
      />
    </>
  );
}
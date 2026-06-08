"use client";

import { useState } from "react";

import EventGrid from "./EventGrid";
import type { EventPreview } from "@/lib/types";

type Props = {
  events: EventPreview[];
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
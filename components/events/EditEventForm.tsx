"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiCall, handleApiError } from "@/lib/client";

type EventType = {
  id: string;
  title: string;
  description: string | null;
};

type Props = {
  event: EventType;
};

export default function EditEventForm({
  event,
}: Props) {
  const router = useRouter();

  const [title, setTitle] =
    useState(event.title);

  const [description, setDescription] =
    useState(
      event.description || ""
    );

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await apiCall(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      router.push("/events");
      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        required
      />

      <Textarea
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        className="min-h-[150px]"
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Updating..."
          : "Update Event"}
      </Button>
    </form>
  );
}
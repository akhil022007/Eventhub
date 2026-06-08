"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiCall, handleApiError } from "@/lib/client";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await apiCall("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, date }),
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
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Create Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Input
          placeholder="Event Name"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        <Input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />

        <Input
          placeholder="Location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        />

        <Textarea
          placeholder="Event Description"
          className="min-h-[150px]"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Event"}
        </Button>
      </form>
    </main>
  );
}
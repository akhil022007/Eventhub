"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Event = {
  id: string;
  title: string;
  creatorId: string;
  members: { role: "ORGANIZER" | "UPLOADER" | "VIEWER" }[];
};

type Me = {
  id: string;
  name: string;
  role: string;
};

export default function UploadPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [eventId, setEventId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const [meRes, eventsRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/events"),
        ]);

        const meData: Me | null = await meRes.json();
        const data: Event[] = await eventsRes.json();

        setMe(meData);

        // You can upload to events you organize (creator) or where the
        // organizer promoted you to UPLOADER. Admins can upload anywhere.
        const uploadable =
          meData?.role === "ADMIN"
            ? data
            : data.filter(
                (event) =>
                  event.creatorId === meData?.id ||
                  event.members?.[0]?.role === "ORGANIZER" ||
                  event.members?.[0]?.role === "UPLOADER"
              );

        setEvents(uploadable);
      } catch (error) {
        console.error(error);
      }
    }

    loadEvents();
  }, []);

  async function handleUpload() {
    if (!eventId || files.length === 0) {
      alert("Select an event and files");
      return;
    }

    try {
      setUploading(true);

      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("eventId", eventId);

        const res = await fetch(
          "/api/media",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to upload ${file.name}`
          );
        }
      }

      alert(
        `${files.length} file(s) uploaded successfully`
      );

      setFiles([]);
      setEventId("");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-2">
        Upload Media
      </h1>

      {me && (
        <p className="text-sm text-muted-foreground mb-8">
          Uploading as <span className="font-medium">{me.name}</span>. You can
          upload to events you organize or were added to as an uploader.
        </p>
      )}

      {events.length === 0 ? (
        <div className="rounded-lg border p-6 text-center space-y-3">
          <p className="text-muted-foreground">
            You don&apos;t have upload access to any events yet. Create an event
            (you become its organizer) or ask an organizer to add you as an
            uploader.
          </p>
          <Link href="/events/create">
            <Button>Create an Event</Button>
          </Link>
        </div>
      ) : (
      <div className="space-y-6">
        <select
          value={eventId}
          onChange={(e) =>
            setEventId(e.target.value)
          }
          className="
            w-full
            p-3
            rounded-lg
            border
            bg-background
          "
        >
          <option value="">
            Select Event
          </option>

          {events.map((event) => (
            <option
              key={event.id}
              value={event.id}
            >
              {event.title}
            </option>
          ))}
        </select>

        <Input
          type="file"
          multiple
          accept="
            image/png,
            image/jpeg,
            image/jpg,
            video/mp4,
            video/webm,
            video/quicktime
          "
          onChange={(e) =>
            setFiles(
              Array.from(
                e.target.files || []
              )
            )
          }
        />

        {files.length > 0 && (
          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              gap-4
            "
          >
            {files.map((file) => (
              <div
                key={file.name}
                className="
                  border
                  rounded-lg
                  p-2
                "
              >
                {file.type.startsWith(
                  "video"
                ) ? (
                  <video
                    controls
                    className="
                      w-full
                      h-40
                      object-cover
                      rounded
                    "
                  >
                    <source
                      src={URL.createObjectURL(
                        file
                      )}
                    />
                  </video>
                ) : (
                  <img
                    src={URL.createObjectURL(
                      file
                    )}
                    alt={file.name}
                    className="
                      w-full
                      h-40
                      object-cover
                      rounded
                    "
                  />
                )}

                <p className="mt-2 text-sm truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? `Uploading ${files.length} file(s)...`
            : `Upload ${
                files.length || ""
              } File(s)`}
        </Button>
      </div>
      )}
    </main>
  );
}
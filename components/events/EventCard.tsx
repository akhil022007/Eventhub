"use client";

import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  title: string;
  photos?: number;
  coverImage?: string | null;
};

export default function EventCard({
  id,
  title,
  photos = 0,
  coverImage,
}: Props) {
  return (
    <Card
      className="
        overflow-hidden
        border-zinc-800
        bg-zinc-950
        hover:border-zinc-700
        transition-all
        duration-300
        hover:scale-[1.02]
      "
    >
      <Link href={`/events/${id}`}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            width={800}
            height={500}
            className="
              w-full
              h-56
              object-cover
            "
          />
        ) : (
          <div
            className="
              h-56
              bg-zinc-900
            "
          />
        )}
      </Link>

      <div className="p-5 space-y-3">
        <h2
          className="
            text-2xl
            font-bold
          "
        >
          {title}
        </h2>

        <p
          className="
            text-zinc-400
          "
        >
          📷 {photos} Photos
        </p>

        <div
          className="
            flex
            gap-2
            mt-4
          "
        >
          <Link
            href={`/events/${id}`}
            className="flex-1"
          >
            <Button className="w-full">
              Open
            </Button>
          </Link>

          <a
            href={`/events/${id}`}
            className="flex-1"
          >
            <Button
              variant="secondary"
              className="w-full"
            >
              Download
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
"use client";

import { useState } from "react";

import MediaModal from "./MediaModal";
import type { GalleryMedia } from "@/lib/types";

type Props = {
  media: GalleryMedia[];
  canManage?: boolean;
  currentUserId?: string | null;
};

export default function EventGallery({
  media,
  canManage = false,
  currentUserId,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [activeTag, setActiveTag] =
    useState<string | null>(null);

  // All distinct tags across this event's media, for the filter bar.
  const allTags = Array.from(
    new Set(media.flatMap((m) => m.tags.map((t) => t.name)))
  ).sort();

  const filteredMedia =
    media.filter((item) => {
      const name =
        item.originalName ||
        item.fileName ||
        "";

      const matchesSearch = name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

      const matchesTag =
        !activeTag ||
        item.tags.some((t) => t.name === activeTag);

      return matchesSearch && matchesTag;
    });

  return (
    <>
      <input
        type="text"
        placeholder="Search media..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
          w-full
          p-3
          rounded-lg
          border
          mb-4
          bg-background
        "
      />

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              activeTag === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:border-zinc-500"
            }`}
          >
            All
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:border-zinc-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-4
        "
      >
        {filteredMedia.map((media) => (
          <MediaModal
            key={media.id}
            mediaId={media.id}
            imageUrl={media.url}
            imageName={
              media.originalName ||
              media.fileName ||
              "Media"
            }
            fileType={
              media.fileType
            }
            likesCount={
              media.likes.length
            }
            likedByMe={
              currentUserId
                ? media.likes.some(
                    (like) => like.userId === currentUserId
                  )
                : false
            }
            comments={
              media.comments
            }
            tags={media.tags}
            canManage={canManage}
          />
        ))}
      </div>
    </>
  );
}
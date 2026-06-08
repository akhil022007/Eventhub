"use client";

import { useState } from "react";

import MediaModal from "./MediaModal";

type MediaType = {
  id: string;
  url: string;
  fileType: string;
  fileName: string | null;
  originalName: string | null;

  likes: {
    id: string;
  }[];

  comments: {
    id: string;
    content: string;
  }[];
};

type Props = {
  media: MediaType[];
};

export default function EventGallery({
  media,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filteredMedia =
    media.filter((item) => {
      const name =
        item.originalName ||
        item.fileName ||
        "";

      return name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
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
          mb-8
          bg-background
        "
      />

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
            comments={
              media.comments
            }
          />
        ))}
      </div>
    </>
  );
}
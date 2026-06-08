"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

type Props = {
  mediaId: string;
  imageUrl: string;
  imageName: string;
  fileType: string;
  likesCount: number;
  comments: {
    id: string;
    content: string;
  }[];
};

export default function MediaModal({
  mediaId,
  imageUrl,
  imageName,
  fileType,
  likesCount,
  comments,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [comment, setComment] =
    useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this image?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/media/${mediaId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("Delete failed");
    }
  }

  async function handleSetCover() {
    try {
      const eventId =
        pathname.split("/").pop();

      const res = await fetch(
        `/api/events/${eventId}/cover`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            imageUrl,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to set cover"
        );
      }

      alert(
        "Cover image updated"
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to set cover image"
      );
    }
  }

  async function handleLike() {
    try {
      const res = await fetch(
        `/api/media/${mediaId}/like`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Like failed"
        );
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to like image"
      );
    }
  }

  async function handleComment() {
    if (!comment.trim()) {
      return;
    }

    try {
      const res = await fetch(
        `/api/media/${mediaId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content: comment,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Comment failed"
        );
      }

      setComment("");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to add comment"
      );
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="
            cursor-pointer
            border
            rounded-xl
            overflow-hidden
            hover:scale-105
            transition
          "
        >
 {fileType.startsWith("video") ? (
  <video
    className="
      w-full
      h-64
      object-cover
    "
  >
    <source src={imageUrl} />
  </video>
) : (
  <Image
    src={imageUrl}
    alt={imageName}
    width={500}
    height={500}
    className="
      w-full
      h-64
      object-cover
    "
  />
)}

          <div className="p-2">
            <p className="text-sm truncate">
              {imageName}
            </p>

            <p className="text-xs text-muted-foreground">
              ❤️ {likesCount} Likes
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogTitle>
          {imageName}
        </DialogTitle>

        <DialogDescription>
          Event media preview
        </DialogDescription>

       {fileType.startsWith("video") ? (
  <video
    controls
    className="
      w-full
      rounded-lg
    "
  >
    <source src={imageUrl} />
  </video>
) : (
  <Image
    src={imageUrl}
    alt={imageName}
    width={1200}
    height={1200}
    className="
      w-full
      h-auto
      rounded-lg
    "
  />
)}

        <div className="space-y-3">
          <h3 className="font-semibold">
            💬 Comments (
            {comments.length}
            )
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map(
              (comment) => (
                <div
                  key={comment.id}
                  className="
                    border
                    rounded-lg
                    p-2
                    text-sm
                  "
                >
                  {comment.content}
                </div>
              )
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              className="
                flex-1
                border
                rounded-lg
                p-2
                bg-background
              "
            />

            <Button
              onClick={handleComment}
            >
              Post
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            variant="secondary"
            onClick={handleLike}
          >
            ❤️ Like
          </Button>

          <Button
            onClick={handleSetCover}
          >
            Set As Cover
          </Button>

          <a
            href={imageUrl}
            download={imageName}
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="secondary"
            >
              Download
            </Button>
          </a>

          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
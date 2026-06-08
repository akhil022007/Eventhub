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
import { apiCall, handleApiError } from "@/lib/client";

type Props = {
  mediaId: string;
  imageUrl: string;
  imageName: string;
  fileType: string;
  likesCount: number;
  likedByMe?: boolean;
  comments: {
    id: string;
    content: string;
  }[];
  tags?: {
    id: string;
    name: string;
  }[];
  canManage?: boolean;
};

export default function MediaModal({
  mediaId,
  imageUrl,
  imageName,
  fileType,
  likesCount,
  likedByMe = false,
  comments,
  tags = [],
  canManage = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [comment, setComment] =
    useState("");

  async function handleDelete() {
    if (!window.confirm("Delete this image?")) return;

    try {
      await apiCall(`/api/media/${mediaId}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    }
  }

  async function handleSetCover() {
    try {
      const eventId = pathname.split("/").pop();

      await apiCall(`/api/events/${eventId}/cover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      alert("Cover image updated");
      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    }
  }

  async function handleLike() {
    try {
      await apiCall(`/api/media/${mediaId}/like`, { method: "POST" });
      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    }
  }

  async function handleComment() {
    if (!comment.trim()) {
      return;
    }

    try {
      await apiCall(`/api/media/${mediaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      setComment("");
      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
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

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-secondary px-3 py-1 text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
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
            variant={likedByMe ? "default" : "secondary"}
            onClick={handleLike}
          >
            {likedByMe ? "❤️ Liked" : "🤍 Like"}
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

          {canManage && (
            <>
              <Button
                onClick={handleSetCover}
              >
                Set As Cover
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete Image
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
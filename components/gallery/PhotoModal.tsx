"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  photoNumber: number;
};

export default function PhotoModal({
  photoNumber,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="
            aspect-square
            rounded-xl
            bg-muted
            border
            hover:scale-105
            transition
            cursor-pointer
            flex
            items-center
            justify-center
          "
        >
          Photo {photoNumber}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogTitle>
          Photo {photoNumber}
        </DialogTitle>

        <DialogDescription>
          Event media preview
        </DialogDescription>

        <div
          className="
            h-[500px]
            rounded-xl
            bg-muted
            flex
            items-center
            justify-center
            text-2xl
          "
        >
          Photo {photoNumber}
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  eventId: string;
  inviteToken: string;
};

export default function InviteLink({ eventId, inviteToken }: Props) {
  const [copied, setCopied] = useState(false);

  // Relative path is SSR-safe to render; the absolute URL is only built on
  // copy (in the browser), avoiding a hydration mismatch on window.origin.
  const path = `/events/${eventId}/join?token=${inviteToken}`;

  async function handleCopy() {
    const link = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context) — fall back.
      window.prompt("Copy this invite link:", link);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Invite viewers</p>
        <p className="truncate text-sm text-muted-foreground">{path}</p>
      </div>

      <Button onClick={handleCopy} variant="secondary">
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}

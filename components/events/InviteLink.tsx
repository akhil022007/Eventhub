"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  eventId: string;
  inviteToken: string;
};

export default function InviteLink({ eventId, inviteToken }: Props) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Read the origin only on the client to avoid a hydration mismatch.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function buildLink() {
    return `${origin}/events/${eventId}/join?token=${inviteToken}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context) — fall back to a prompt.
      window.prompt("Copy this invite link:", buildLink());
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Invite viewers</p>
        <p className="truncate text-sm text-muted-foreground">
          {buildLink()}
        </p>
      </div>

      <Button onClick={handleCopy} variant="secondary">
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}

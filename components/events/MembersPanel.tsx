"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiCall, handleApiError } from "@/lib/client";
import type { EventMemberView } from "@/lib/types";

type Props = {
  eventId: string;
  members: EventMemberView[];
};

export default function MembersPanel({ eventId, members }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setRole(
    userId: string,
    role: "UPLOADER" | "VIEWER"
  ) {
    try {
      setBusyId(userId);

      await apiCall(`/api/events/${eventId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(userId: string, name: string) {
    if (!window.confirm(`Remove ${name} from this event?`)) return;

    try {
      setBusyId(userId);

      await apiCall(`/api/events/${eventId}/members/${userId}`, {
        method: "DELETE",
      });

      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        People with access ({members.length})
      </h2>

      <div className="space-y-3">
        {members.map((member) => {
          const busy = busyId === member.userId;

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between gap-4 border-b pb-3"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {member.name}
                  {member.isCreator && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (creator)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {member.email} · {member.role}
                </p>
              </div>

              {/* The creator is always the owning organizer — no actions. */}
              {!member.isCreator && (
                <div className="flex gap-2 shrink-0">
                  {member.role === "VIEWER" ? (
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => setRole(member.userId, "UPLOADER")}
                    >
                      Make uploader
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => setRole(member.userId, "VIEWER")}
                    >
                      Make viewer
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    disabled={busy}
                    onClick={() => remove(member.userId, member.name)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

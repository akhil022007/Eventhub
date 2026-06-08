"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  role: string;
};

export default function Sidebar() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(
          "/api/me"
        );

        const data =
          await res.json();

        setUser(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await fetch(
        "/api/logout",
        {
          method: "POST",
        }
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert("Logout failed");
    }
  }

  return (
    <aside className="w-64 border-r min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">
        EventHub
      </h1>

      {user && (
        <div className="mb-6">
          <p className="font-medium">
            {user.name}
          </p>

          <p className="text-sm text-muted-foreground">
            {user.role}
          </p>
        </div>
      )}

      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="block hover:text-primary"
        >
          Dashboard
        </Link>

        <Link
          href="/events"
          className="block hover:text-primary"
        >
          Events
        </Link>

        {(user?.role ===
          "ADMIN" ||
          user?.role ===
            "ORGANIZER") && (
          <>
            <Link
              href="/events/create"
              className="block hover:text-primary"
            >
              Create Event
            </Link>

            <Link
              href="/upload"
              className="block hover:text-primary"
            >
              Upload Media
            </Link>
          </>
        )}

        <button
          onClick={handleLogout}
          className="
            block
            text-left
            hover:text-primary
          "
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
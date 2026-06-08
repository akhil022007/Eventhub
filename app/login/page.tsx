"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiCall, handleApiError } from "@/lib/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      await apiCall("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const callbackUrl =
        new URLSearchParams(
          window.location.search
        ).get("callbackUrl");

      router.push(
        callbackUrl || "/dashboard"
      );

      router.refresh();
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="text-muted-foreground mt-2">
          Login to your account
        </p>

        <div className="space-y-4 mt-8">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <Button
            className="w-full"
            onClick={
              handleLogin
            }
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
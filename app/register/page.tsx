"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message
        );
      }

      alert(
        "Registration successful"
      );

      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">
          Create Account
        </h1>

        <p className="text-muted-foreground mt-2">
          Join EventHub
        </p>

        <div className="space-y-4 mt-8">
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

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
              handleRegister
            }
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Register"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
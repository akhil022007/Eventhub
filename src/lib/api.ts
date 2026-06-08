import { NextResponse } from "next/server";

// Small helpers to keep API route handlers free of repeated NextResponse
// boilerplate. Each returns a JSON response with the right status code.

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ message }, { status: 404 });
}

/**
 * Logs the error server-side and returns a generic 500 with the given message.
 * Never leaks the underlying error to the client.
 */
export function serverError(message: string, error?: unknown) {
  if (error !== undefined) {
    console.error(error);
  }

  return NextResponse.json({ message }, { status: 500 });
}

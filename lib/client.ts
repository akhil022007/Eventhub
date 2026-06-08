// Client-side fetch helpers to remove the repeated
// fetch -> check res.ok -> parse -> throw pattern across components.

/**
 * Fetch JSON from an API route. Throws an Error with the server's `message`
 * (or a generic fallback) when the response is not ok.
 */
export async function apiCall<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

/** Normalize an unknown caught value into a user-facing message. */
export function handleApiError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

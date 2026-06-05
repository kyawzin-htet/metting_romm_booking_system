import { apiUrl } from "../constants";
import type { ApiError, User } from "../types/domain";

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as T & ApiError;
  if (!response.ok) {
    const details = body.error?.details?.map((detail) => detail.message).join(", ");
    throw new Error(details || body.error?.message || "Request failed");
  }

  return body;
}

export async function apiRequest<T>(
  path: string,
  currentUser: User | null,
  options: RequestInit = {}
) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (currentUser) {
    headers.set("x-user-id", String(currentUser.id));
  }

  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  return parseApiResponse<T>(response);
}

export async function loadAuthUsers() {
  const response = await fetch(`${apiUrl}/api/auth/users`);
  return parseApiResponse<{ users: User[] }>(response);
}

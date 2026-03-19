import { BACKEND_URL } from "@/lib/constants";

/**
 * Sync user with backend using Better Auth token
 */
export async function syncUser(token: string): Promise<void> {
  if (!BACKEND_URL) {
    throw new Error("Missing BACKEND_URL environment variable");
  }

  if (!token) {
    throw new Error("Missing auth token");
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Sync failed");
  }
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Create fetch options with auth headers
 */
export function getAuthFetchOptions(token: string, options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders(token),
    },
    credentials: "include",
  };
}

/**
 * Fetch user data from backend
 */
export async function fetchUserData(token: string) {
  const response = await fetch(`${BACKEND_URL}/api/me`, {
    method: "GET",
    headers: getAuthHeaders(token),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
}

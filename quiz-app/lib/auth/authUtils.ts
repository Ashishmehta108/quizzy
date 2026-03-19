/**
 * Auth utilities
 * Centralized utility functions for authentication
 */

import { syncUser as syncUserFn } from "./authService";

/**
 * Sync user with backend - wrapper around authService.syncUser
 */
export const syncUser = async ({ getToken }: { getToken: () => Promise<string | null> }) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Missing session token");
    }
    await syncUserFn(token);
  } catch (err) {
    console.error("Sync error:", err);
    throw err;
  }
};

/**
 * Format authorization header value
 */
export function formatAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Parse authorization header
 */
export function parseAuthHeader(header: string): string | null {
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice(7);
}

/**
 * Check if token is expired (basic check)
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  
  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check exp claim if present
    if (payload.exp) {
      const now = Date.now() / 1000;
      return now >= payload.exp;
    }
    
    return false;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * @layer types
 * @description Type definitions for authentication module
 */

export interface UserData {
  id: string;
  clerkId: string;
  email: string | null;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  apiKey: string | null;
  apiKeyLastRotatedAt: Date | null;
}

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
}

export interface SyncUserRequest {
  auth?: {
    userId: string;
  };
}

export interface SyncUserResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date | null;
    apiKey: string | null;
  };
  billingCreated: boolean;
  workspaceCreated: boolean;
}

export interface RateLimitHeaders {
  "X-RateLimit-Limit"?: string;
  "X-RateLimit-Remaining"?: string;
  "X-RateLimit-Reset"?: string;
  "X-Request-Count"?: string;
  "Retry-After"?: string;
}

export interface AuthEvent {
  clerkId: string;
  eventType: string;
  timestamp: string;
}

export interface AuthEventsResponse {
  events: string[];
}

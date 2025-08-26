import { SyncUserRequest, SyncUserResponse } from "../routes/auth";

export interface UserData {
  id: string;
  clerkId: string;
  email?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
}

export const syncUser: (
  req: SyncUserRequest,
  res: SyncUserResponse
) => Promise<void>;

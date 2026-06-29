import { SyncUserRequest, SyncUserResponse } from "../routes/auth";

export interface UserData {
  id: string;
  email?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const syncUser: (
  req: SyncUserRequest,
  res: SyncUserResponse
) => Promise<void>;

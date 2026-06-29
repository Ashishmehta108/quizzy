import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_BACK_URL || "http://localhost:5000"}/api/auth`,
  plugins: [dodopaymentsClient()],
});


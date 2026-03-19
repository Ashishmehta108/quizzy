/**
 * Authentication routes configuration
 */
export const AUTH_ROUTES = {
  // Better Auth authentication routes
  SIGN_IN: "/sign-in",
  SIGN_UP: "/register",
  SIGN_OUT: "/",

  // Post-auth routes
  POST_LOGIN: "/post-login",
  SSO_CALLBACK: "/sso-callback",
  VERIFY_EMAIL: "/verify-email",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/dashboard/profile",

  // OAuth redirect URLs
  OAUTH_REDIRECT: "/sso-callback?redirect=/post-login",
  OAUTH_COMPLETE: "/post-login",
} as const;

/**
 * OAuth providers configuration
 */
export const OAUTH_PROVIDERS = {
  GOOGLE: "oauth_google",
  GITHUB: "oauth_github",
} as const;

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS];

/**
 * Auth status messages
 */
export const AUTH_MESSAGES = {
  SYNC_SUCCESS: "User synced successfully",
  SYNC_FAILED: "Sync failed",
  MISSING_TOKEN: "Missing session token",
  MISSING_BACKEND_URL: "Missing BACKEND_URL environment variable",
  SIGNIN_COMPLETE: "Sign in complete",
  SIGNUP_COMPLETE: "Account created successfully",
  VERIFICATION_SENT: "Verification email sent",
} as const;

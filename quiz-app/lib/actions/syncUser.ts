export const syncUser = async ({ getToken }: { getToken: () => Promise<string | null> }) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;
    console.log("syncing user with backend:", backendUrl);
    if (!backendUrl) throw new Error("Missing BACKEND URL env");
    const jwt = await getToken();
    if (!jwt) throw new Error("Missing Clerk session token");
    const res = await fetch(`${backendUrl}/api/auth/sync`, {
      method: "GET",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) throw new Error("Sync failed");
  } catch (err) {
    console.error("Sync error:", err);
  }
};

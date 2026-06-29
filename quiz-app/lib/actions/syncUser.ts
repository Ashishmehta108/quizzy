export const syncUser = async () => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;
    console.log("syncing user with backend:", backendUrl);
    if (!backendUrl) throw new Error("Missing BACKEND URL env");
    const resToken = await fetch("/api/getToken");
    const { token } = await resToken.json();
    if (!token) throw new Error("Missing Better Auth session token");
    const res = await fetch(`${backendUrl}/api/auth/sync`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Sync failed");
  } catch (err) {
    console.error("Sync error:", err);
  }
};


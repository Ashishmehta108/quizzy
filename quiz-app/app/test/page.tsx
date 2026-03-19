"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/auth-client";

export default function TestPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = session?.session?.token;
        console.log("Session token:", token);

        if (!token) {
          setError("No session token found. Are you signed in?");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:5000/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [getToken]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Auth Test Page</h1>
      <pre className="mt-4 rounded bg-gray-100 p-4 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

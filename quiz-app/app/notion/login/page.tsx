"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function NotionLoginHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("Checking login...");

    useEffect(() => {
        const success = searchParams.get("success");
        const error = searchParams.get("error");

        if (success === "true") {
            setStatus("✅ Successfully connected to Notion!");
            setTimeout(() => router.push("/"), 2000);
        } else if (error) {
            setStatus("❌ Notion login failed: " + error);
        }
    }, [searchParams, router]);

    return (
        <main
            style={{
                display: "grid",
                placeItems: "center",
                height: "100vh",
                gap: 16,
                textAlign: "center",
            }}
        >
            <h1>Notion Login</h1>
            <p>{status}</p>
            <button
                onClick={() => router.push("/")}
                style={{ padding: "10px 16px", fontSize: 16 }}
            >
                Go Home
            </button>
        </main>
    );
}

export default function NotionLoginPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <NotionLoginHandler />
        </Suspense>
    );
}

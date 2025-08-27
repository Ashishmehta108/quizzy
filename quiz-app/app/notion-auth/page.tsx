"use client";
import React from "react";

export default function Home() {
    const API_BASE = "http://localhost:5000/api/notion";

    const connectNotion = () => {
        window.location.href = `${API_BASE}/login`;
    };

    const viewDatabases = async () => {
        try {
            const res = await fetch(`${API_BASE}/databases`, {
                credentials: "include",
            });

            if (!res.ok) {
                const error = await res.text();
                alert("Error: " + error);
                return;
            }

            const data = await res.json();
            console.log("Databases:", data);
            alert(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("Failed to fetch databases", err);
            alert("Failed to fetch databases");
        }
    };

    const viewIntegration = async () => {
        try {
            const res = await fetch(`${API_BASE}/integration`, {
                credentials: "include",
            });

            if (!res.ok) {
                const error = await res.text();
                alert("Error: " + error);
                return;
            }

            const data = await res.json();
            console.log("Integration Info:", data);
            alert(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("Failed to fetch integration info", err);
            alert("Failed to fetch integration info");
        }
    };

    return (
        <main
            style={{
                display: "grid",
                gap: 16,
                placeItems: "center",
                height: "100vh",
            }}
        >
            <h1>Notion OAuth Demo</h1>

            <button
                onClick={connectNotion}
                style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
            >
                Connect Notion
            </button>

            <button
                onClick={viewDatabases}
                style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
            >
                List My Notion Databases
            </button>

            <button
                onClick={viewIntegration}
                style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
            >
                View Integration Info
            </button>

            <p>
                1. Click <b>"Connect Notion"</b> to authorize. <br />
                2. Then click <b>"List My Notion Databases"</b> or{" "}
                <b>"View Integration Info"</b>.
            </p>
        </main>
    );
}

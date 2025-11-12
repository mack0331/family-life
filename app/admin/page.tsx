"use client";

import { useState, useEffect } from "react";
import TaskForm from "@/components/TaskForm";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"database" | "users" | "tasks">("database");
    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState<"success" | "error" | "loading" | "">("");
    const [dbFiles, setDbFiles] = useState<string[]>([]);

    useEffect(() => {
        const fetchDbFiles = async () => {
            setStatus("Searching for .db files...");
            setStatusType("loading");

            try {
                const res = await fetch("/api/list-db-files");
                const data = await res.json();

                if (data.success) {
                    setDbFiles(data.files);
                    setStatus(`Found ${data.files.length} .db file(s).`);
                    setStatusType("success");
                } else {
                    setStatus("Failed to list .db files.");
                    setStatusType("error");
                }
            } catch (err) {
                setStatus("Error fetching .db files.");
                setStatusType("error");
            }
        };

        fetchDbFiles();
    }, []);

    const handleMigrate = async () => {
        setStatus("Running migration...");
        setStatusType("loading");

        try {
            const res = await fetch("/api/migrate");
            const data = await res.json();

            if (data.success) {
                setStatus(data.message);
                setStatusType("success");
            } else {
                setStatus(data.message || "Migration failed.");
                setStatusType("error");
            }
        } catch (err) {
            setStatus("Migration failed due to network or server error.");
            setStatusType("error");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administrator Settings</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-6">
                {["database", "users", "tasks"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`pb-2 px-4 font-medium ${
                            activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Status Message */}
            {status && (
                <div className={`mb-4 p-3 border rounded ${statusType === "success" ? "border-green-500" : "border-red-500"}`}>
                    {status}
                </div>
            )}

            {/* Tab Content */}
            {activeTab === "database" && (
                <div>
                    <button
                        onClick={handleMigrate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Run Migrations
                    </button>

                    {dbFiles.length > 0 && (
                        <ul className="mt-4 list-disc list-inside text-sm text-gray-700">
                            {dbFiles.map((file, idx) => (
                                <li key={idx}>{file}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {activeTab === "tasks" && <TaskForm />}
        </div>
    );
}
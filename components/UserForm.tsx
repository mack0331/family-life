"use client";

import { useState, FormEvent } from "react";

export default function UserForm() {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "loading" | "">("");
  const [showForm, setShowForm] = useState(false);

  const [userForm, setUserForm] = useState({
    id: null,
    name: "",
    email: "",
    role: "user",
  });

  const handleUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(userForm.id ? "Updating user..." : "Creating user...");
    setStatusType("loading");

    try {
      const res = await fetch("/api/users", {
        method: userForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(data.message || "Success!");
        setStatusType("success");
        setUserForm({ id: null, name: "", email: "", role: "user" });
      } else {
        setStatus(data.error || "Failed to save user.");
        setStatusType("error");
      }
    } catch (err) {
      setStatus("Network or server error.");
      setStatusType("error");
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="bg-green-600 text-white px-4 py-3 rounded-lg text-lg w-full sm:w-auto"
      >
        {showForm ? "Hide User Form" : "Add New User"}
      </button>

      {showForm && (
        <form onSubmit={handleUserSubmit} className="space-y-4 max-w-xl bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold">{userForm.id ? "Edit User" : "Create New User"}</h2>

          <input
            type="text"
            placeholder="Name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            className="w-full border px-3 py-3 rounded text-lg"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            className="w-full border px-3 py-3 rounded text-lg"
            required
          />

          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            className="border px-3 py-3 rounded text-lg w-full"
          >
            <option value="parent">Parent</option>
            <option value="kid">Kid</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-3 rounded-lg text-lg w-full sm:w-auto"
          >
            {userForm.id ? "Update User" : "Submit User"}
          </button>

          {status && (
            <div
              className={`mt-4 p-3 border rounded ${
                statusType === "success"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : statusType === "error"
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
              }`}
            >
              {status}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
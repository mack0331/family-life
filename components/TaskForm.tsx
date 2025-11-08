"use client";

import { useState, FormEvent } from "react";

export default function TaskForm() {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "loading" | "">("");
  const [showForm, setShowForm] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    type: "task",
    priority: "medium",
    start_date: "",
    due_date: "",
    recurrence: "",
    notes: "",
  });

  const handleTaskSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Creating task...");
    setStatusType("loading");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(data.message);
        setStatusType("success");
        setTaskForm({
          title: "",
          description: "",
          type: "task",
          priority: "medium",
          start_date: "",
          due_date: "",
          recurrence: "",
          notes: "",
        });
      } else {
        setStatus(data.error || "Failed to create task.");
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
        {showForm ? "Hide Task Form" : "Create New Task"}
      </button>

      {showForm && (
        <form onSubmit={handleTaskSubmit} className="space-y-4 max-w-xl bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold">Create New Task</h2>

          <input
            type="text"
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            className="w-full border px-3 py-3 rounded text-lg"
            required
          />

          <textarea
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            className="w-full border px-3 py-3 rounded text-lg"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={taskForm.type}
              onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
              className="border px-3 py-3 rounded text-lg w-full"
            >
              <option value="task">Task</option>
              <option value="chore">Chore</option>
              <option value="goal">Goal</option>
            </select>

            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              className="border px-3 py-3 rounded text-lg w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={taskForm.start_date}
              onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
              className="border px-3 py-3 rounded text-lg w-full"
            />
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              className="border px-3 py-3 rounded text-lg w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Recurrence (e.g., daily, weekly)"
            value={taskForm.recurrence}
            onChange={(e) => setTaskForm({ ...taskForm, recurrence: e.target.value })}
            className="w-full border px-3 py-3 rounded text-lg"
          />

          <textarea
            placeholder="Notes"
            value={taskForm.notes}
            onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
            className="w-full border px-3 py-3 rounded text-lg"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-3 rounded-lg text-lg w-full sm:w-auto"
          >
            Submit Task
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
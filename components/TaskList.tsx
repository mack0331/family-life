import { useState, useEffect, FormEvent } from "react";
import {
  Note,
  PaintBrushBroad,
  Target,
  ArrowDown,
  Equals,
  ArrowUp,
  Hourglass,
  SpinnerGap,
  CheckCircle,
} from "phosphor-react";

const typeIcons = {
  task: <Note size={20} weight="fill" className="text-blue-500" />,
  chore: <PaintBrushBroad size={20} weight="fill" className="text-yellow-500" />,
  goal: <Target size={20} weight="fill" className="text-purple-500" />,
};

const priorityIcons = {
  low: <ArrowDown size={20} weight="fill" className="text-green-500" />,
  medium: <Equals size={20} weight="fill" className="text-orange-500" />,
  high: <ArrowUp size={20} weight="fill" className="text-red-500" />,
};

const statusIcons = {
  future: <Hourglass size={20} weight="fill" className="text-gray-500" />,
  in_progress: <SpinnerGap size={20} weight="fill" className="text-blue-500 animate-spin" />,
  completed: <CheckCircle size={20} weight="fill" className="text-green-600" />,
};

type Task = {
  id: number;
  title: string;
  description: string;
  type: "task" | "chore" | "goal";
  priority: "low" | "medium" | "high";
  status: "future" | "in_progress" | "completed";
  start_date?: string;
  due_date?: string;
  recurrence?: string;
  notes?: string;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    if (data.success) setTasks(data.tasks);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    const res = await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (data.success) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } else {
      alert("Failed to delete task.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm(task);
  };

  const handleEditChange = (field: keyof Task, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    const data = await res.json();
    if (data.success) {
      fetchTasks();
      setEditingTaskId(null);
    } else {
      alert("Failed to update task.");
    }
  };

  if (loading) return <p className="mt-6 text-gray-500">Loading tasks...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Existing Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex border rounded shadow-sm overflow-hidden"
            >
              <div
                className={`w-2 ${task.status === "future"
                    ? "bg-yellow-400"
                    : task.status === "completed" && task.due_date && new Date(task.due_date) < new Date()
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
              />
              <div className="flex-1 p-4">
                {editingTaskId === task.id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) => handleEditChange("title", e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) => handleEditChange("description", e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                    />
                    <div className="flex gap-4">
                      <select
                        value={editForm.type || "task"}
                        onChange={(e) => handleEditChange("type", e.target.value)}
                        className="border px-3 py-2 rounded"
                      >
                        <option value="task">Task</option>
                        <option value="chore">Chore</option>
                        <option value="goal">Goal</option>
                      </select>
                      <select
                        value={editForm.priority || "medium"}
                        onChange={(e) => handleEditChange("priority", e.target.value)}
                        className="border px-3 py-2 rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="date"
                        value={editForm.due_date || ""}
                        onChange={(e) => handleEditChange("due_date", e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Recurrence"
                      value={editForm.recurrence || ""}
                      onChange={(e) => handleEditChange("recurrence", e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div onClick={() => handleEdit(task)}>
                    <div className="font-bold text-lg flex items-center gap-2">
                      {task.title}
                    </div>
                    {task.status !== 'completed' &&
                      <>
                        <div className="text-sm text-gray-600">{task.description}</div>

                        <div className="text-sm flex flex-wrap gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            {priorityIcons[task.priority]}
                            <span className="font-medium">Effort:</span> {task.priority}
                          </span>
                          <span className="flex items-center gap-1">
                            {statusIcons[task.status]}
                            <span className="font-medium">Status:</span> {task.status}
                          </span>
                          <span className="flex items-center gap-1">
                            {typeIcons[task.type]}
                            <span className="font-medium">Type:</span> {task.type}
                          </span>
                        </div>
                      </>}
                        <div className="text-sm text-gray-500 mt-1">
                        {task.status !== 'completed' ? "Due " : "Done " } 
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"}
                        </div>

                  </div>
                )}

              </div>
              <button
                onClick={() => handleDelete(task.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full sm:w-auto mt-2 sm:mt-0"
              >
                Delete Task
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

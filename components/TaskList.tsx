"use client";

import { useState, useEffect, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFloppyDisk, faTimes, faArrowLeftLong, faArrowRightLong, faRefresh } from "@fortawesome/free-solid-svg-icons";
import TaskModal from "./TaskModal";

interface Task {
  id: number;
  title: string;
  assignee: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  start_date?: string;
  due_date?: string;
  recurrence?: string;
  notes?: string;
}

const familyMembers = ["Asher", "Ellie", "Evan", "Owen", "Katie", "Eric"];

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddMember, setQuickAddMember] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showOverdue, setShowOverdue] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    if (data.success) {
      const normalizedTasks = data.tasks.map((task: Task) => ({
        ...task,
        due_date: task.due_date ? new Date(task.due_date) : null,
        start_date: task.start_date ? new Date(task.start_date) : null,
      }));
      setTasks(normalizedTasks);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleQuickAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle || !quickAddMember) return;

    const newTask = {
      title: quickAddTitle,
      assignee: quickAddMember,
      description: "",
      type: "",
      priority: "",
      start_date: "",
      due_date: selectedDate.toISOString(), // ✅ Convert to ISO
      recurrence: "",
      notes: "",
      status: "incomplete",
    };


    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      if (res.ok) {
        setQuickAddTitle("");
        setQuickAddMember(null);
        fetchTasks();
      } else {
        alert(data.error || "Failed to create task.");
      }
    } catch {
      alert("Network error while creating task.");
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "complete" ? "incomplete" : "complete";

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Network error while updating status.");
    }
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const getMemberColor = (member: string) => {
    switch (member) {
      case "Asher": return "#22ac00";
      case "Ellie": return "#20dfd5";
      case "Evan": return "#5c8df5";
      case "Owen": return "#f3b43f";
      case "Katie": return "#c63ce6a8";
      case "Eric": return "#df3838c7";
      default: return "#ccc";
    }
  };

  const formatForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  if (loading) return <p className="mt-6 text-gray-500">Loading tasks...</p>;

  return (
    <div className="flex text-center flex-col">
      <div className="absolute top-0 right-0 p-1">
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary mr-2">
          <FontAwesomeIcon icon={faRefresh}></FontAwesomeIcon>
        </button>
      </div>
      <div className="mb-2 font-bold">
        <h1 className="page-title text-xl mb-2">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",    // e.g., Wednesday
            year: "numeric",    // e.g., 2025
            month: "long",      // e.g., November
            day: "numeric",     // e.g., 12
          })}
        </h1>
      </div>

      {/* Calendar Filter */}
      <div className="calendar-nav justify-center flex text-sm">
        <button onClick={goToPreviousDay} className="btn-secondary mr-2">
          <FontAwesomeIcon icon={faArrowLeftLong}></FontAwesomeIcon>
        </button>

        {/* Date Picker */}
        <input
          type="date"
          value={formatForInput(selectedDate)} // ✅ Local date
          onChange={(e) => {
            const newDate = new Date(e.target.value + "T00:00:00"); // ✅ Force local midnight
            setSelectedDate(newDate);
          }}
          className="border rounded px-2 py-1"
        />
        <button onClick={goToNextDay} className="btn-secondary ml-2">
          <FontAwesomeIcon icon={faArrowRightLong}></FontAwesomeIcon>
        </button>

      </div>

      {/* Show Overdue Toggle */}

      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={showOverdue}
          onChange={() => setShowOverdue((prev) => !prev)}
          className="cursor-pointer"
        />
        <label className="text-gray-700 text-sm">Show overdue</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-1 text-left">
        {familyMembers.map((member) => {
          const memberTasks = tasks.filter((task) => {
            if (task.assignee !== member) return false;
            if (!task.due_date) return true;

            const taskDate = task.due_date ? new Date(task.due_date) : null;

            if (showOverdue) {
              return (
                taskDate &&
                ((taskDate < selectedDate && task.status === "incomplete") ||
                  taskDate.toDateString() === selectedDate.toDateString())
              );
            }

            return taskDate && taskDate.toDateString() === selectedDate.toDateString();

          });

          return (

            <div key={member} className="flex flex-col mb-2">

              {/* Header */}
              <div className="member-header"
                style={{ backgroundColor: getMemberColor(member) }}
              >
                <h3>{member}</h3>
                <button
                  onClick={() => setQuickAddMember(member)}
                  className="quick-add-btn"
                  title={`Add task for ${member}`}
                >
                  <FontAwesomeIcon color={"black"} icon={faPlus} />
                </button>
              </div>

              {/* Tasks */}
              <div className="task-list">
                {(memberTasks.length === 0) ? (
                  <>
                    {quickAddMember !== member && <>
                      <p className="no-tasks">No tasks</p>
                    </>
                    }
                  </>

                ) : (
                  memberTasks.map((task) => (

                    <div key={task.id} className="task-card"
                      style={{ borderColor: getMemberColor(member) }}
                    >

                      <div className="flex items-center flex-row gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === "complete"}
                          style={{ width: "24px", height: "24px" }} // ✅ Object, not string
                          onChange={() => toggleTaskStatus(task)}
                          className={`cursor-pointer ${getMemberColor(member)}`}
                        />
                        <div onClick={() => setSelectedTask(task)}

                          className={`task-title w-full ${task.status === "complete" ? "line-through text-gray-500" : ""
                            }`}
                        >
                          {task.title}
                        </div>
                      </div>
                      {formatDate(task.due_date ?? null) !== selectedDate.toLocaleDateString() && (
                        <div className="task-date ml-7">
                          <span className="text-red-600">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : ""}
                          </span>
                        </div>
                      )}
                    </div>


                  ))
                )}

              </div>
              {selectedTask && (
                <TaskModal
                  task={selectedTask}
                  onClose={() => setSelectedTask(null)}
                  onSave={async (updatedTask) => {
                    const res = await fetch("/api/tasks", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updatedTask),
                    });
                    if (res.ok) {
                      fetchTasks();
                      setSelectedTask(null);
                    } else {
                      alert("Failed to save changes");
                    }
                  }}
                  onDelete={async (taskId) => {
                    const res = await fetch("/api/tasks", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: taskId }),
                    });
                    if (res.ok) {
                      fetchTasks();
                      setSelectedTask(null);
                    } else {
                      alert("Failed to delete task");
                    }
                  }}
                />
              )}

              {/* Quick Add Form */}
              {quickAddMember === member && (
                <div className={`border-1 rounded-sm flex ${memberTasks.length === 0 ? '' : 'mt-2'}`}>
                  <div className="flex w-full">
                    <form onSubmit={handleQuickAddSubmit} className="quick-add-form">
                      <input
                        type="text"
                        placeholder="Task title"
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                        required
                        className="w-full focus:outline-none"
                      />
                    </form>
                  </div>
                  <div className="flex">
                    <button
                      onClick={handleQuickAddSubmit}
                      className="btn-primary" title="Save">
                      <FontAwesomeIcon icon={faFloppyDisk} />
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      title="Cancel"
                      color={"red"}
                      onClick={() => {
                        setQuickAddMember(null);
                        setQuickAddTitle("");
                      }}
                    >
                      <FontAwesomeIcon color="red" icon={faTimes} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          );
        })}
      </div>
    </div>
  );
}
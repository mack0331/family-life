"use client";

import { useState, useEffect, FormEvent } from "react";
import TaskList from "@/components/TaskList";

type Task = {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  start_date?: string;
  due_date?: string;
  recurrence?: string;
  notes?: string;
};

export default function AdminPage() {

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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const statusStyles = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    loading: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  return (
    <div className="px-3">
    <TaskList />
    </div>
  );
}
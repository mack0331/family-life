"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

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

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
}

const formatForInput = (date: string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TaskModal({ task, onClose, onSave, onDelete }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);

  return (
    <div className="ml-36 fixed inset-0 bg-gray bg-opacity-50 flex items-center justify-center z-50">        
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative border-1">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        {/* Editable Fields */}
        <div className="space-y-3">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="border rounded w-full p-2"
            placeholder="Title"
          />
          <input
            type="date"
            value={formatForInput(editedTask.due_date)}
            onChange={(e) =>
              setEditedTask({
                ...editedTask,
                due_date: new Date(e.target.value + "T00:00:00").toISOString(),
              })
            }
            className="border rounded w-full p-2"
          />
          <textarea
            value={editedTask.description || ""}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="border rounded w-full p-2"
            placeholder="Description"
          />
          <select
            value={editedTask.status || "incomplete"}
            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
            className="border rounded w-full p-2"
          >
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onDelete(editedTask.id)}
            //onClick={() => alert(editedTask.id)}
            className="btn-secondary text-red-500 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
          <button
            onClick={() => onSave(editedTask)}
            className="btn-primary flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFloppyDisk} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
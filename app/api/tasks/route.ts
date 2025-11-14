import { apiPost, apiPatch } from "../database";
import { db } from "../database";
import { NextResponse } from "next/server";

// Define a type for the task fields
interface Task {
  id?: number;
  title: string;
  assignee: string;
  due_date?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  start_date?: string;
  recurrence?: string;
  notes?: string;
}

// POST NEW TASK //
export async function POST(req: Request): Promise<Response> {
  const body: Task = await req.json();
  const {
    title,
    assignee,
    due_date,
    description,
    type,
    priority,
    status,
    start_date,
    recurrence,
    notes,
  } = body;

  if (!title || !assignee) {
    return NextResponse.json({ error: "Title and assignee are required." }, { status: 400 });
  }

  const query = `
    INSERT INTO tasks (
      title, assignee, due_date, description, type, priority, status,
      start_date, recurrence, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

const values: string[] = [
  title,
  assignee,
  due_date ?? "",
  description ?? "",
  type ?? "",
  priority ?? "",
  status ?? "",
  start_date ?? "",
  recurrence ?? "",
  notes ?? "",
];

  try {
    await apiPost(query, values);
    return NextResponse.json({ message: "Successfully created task" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET ALL TASKS //
export async function GET(): Promise<Response> {
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM tasks ORDER BY due_date ASC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    return NextResponse.json({ success: true, tasks: rows }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE TASK //
export async function DELETE(req: Request): Promise<Response> {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: "Task ID is required." }, { status: 400 });
  }

  try {
    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH TASK //
export async function PATCH(req: Request): Promise<Response> {
  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Task ID is required for update." },
      { status: 400 }
    );
  }

  const keys = Object.keys(fields).filter((key) => fields[key] !== undefined && fields[key] !== null);

  if (keys.length === 0) {
    return NextResponse.json(
      { success: false, error: "No fields provided to update." },
      { status: 400 }
    );
  }

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => fields[key]);

  const query = `UPDATE tasks SET ${setClause} WHERE id = ?`;

  try {
    const result = await apiPatch(query, [...values, id]);
    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: "No task was updated." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Successfully updated task" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

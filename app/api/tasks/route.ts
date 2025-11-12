import { apiPost, apiPatch } from "../database";
import { db } from "../database";
import { NextResponse } from "next/server";

// POST NEW TASK //
export async function POST(req: Request) {
  const body = await req.json();
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
    return Response.json({ error: "Title and assignee are required." }, { status: 400 });
  }

  const query = `
    INSERT INTO tasks (
      title, assignee, due_date, description, type, priority, status,
      start_date, recurrence, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
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
  ];

  try {
    await apiPost(query, values);
    return Response.json({ message: "Successfully created task" }, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

// GET ALL TASKS //
export async function GET() {
  return new Promise((resolve) => {
    db.all("SELECT * FROM tasks ORDER BY due_date ASC", [], (err, rows) => {
      if (err) {
        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ success: true, tasks: rows }, { status: 200 }));
      }
    });
  });
}

// DELETE TASK //
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return Response.json({ success: false, error: "Task ID is required." }, { status: 400 });
  }

  return new Promise((resolve) => {
    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ success: true, message: "Task deleted successfully" }, { status: 200 }));
      }
    });
  });
}

// PATCH TASK //
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return Response.json(
      { success: false, error: "Task ID is required for update." },
      { status: 400 }
    );
  }

  // Remove any undefined or null fields so we only update provided values
  const keys = Object.keys(fields).filter((key) => fields[key] !== undefined && fields[key] !== null);

  if (keys.length === 0) {
    return Response.json(
      { success: false, error: "No fields provided to update." },
      { status: 400 }
    );
  }

  // Build dynamic SET clause
  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => fields[key]);

  const query = `UPDATE tasks SET ${setClause} WHERE id = ?`;

  try {
    const result = await apiPatch(query, [...values, id]);
    if (result.changes === 0) {
      return Response.json(
        { success: false, error: "No task was updated." },
        { status: 404 }
      );
    }
    return Response.json(
      { success: true, message: "Successfully updated task" },
      { status: 200 }
    );
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
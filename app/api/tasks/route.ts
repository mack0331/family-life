
import { apiPost, apiPatch } from "../database";
import { db } from "../database";
import { NextResponse } from "next/server";

//POST NEW TASK//
export async function POST(req: Request) {
  const body = await req.json();
  const {
    title,
    description,
    type,
    priority = "medium",
    status = "future",
    start_date,
    due_date,
    recurrence,
    notes,
  } = body;

  const query = `
    INSERT INTO tasks (
      title, description, type, priority, status,
      start_date, due_date, recurrence, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    description,
    type,
    priority,
    status,
    start_date,
    due_date,
    recurrence,
    notes,
  ];

  let statusCode, respBody;
  await apiPost(query, values)
    .then(() => {
      statusCode = 200;
      respBody = { message: "Successfully created task" };
    })
    .catch((err) => {
      statusCode = 400;
      respBody = { error: err.message };
    });

  return Response.json(respBody, { status: statusCode });
}

//GET ALL TASKS//
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

//DELETE TASK//
export async function DELETE(req: Request) {
  const { id } = await req.json();

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

//PATCH TASK//
export async function PATCH(req: Request) {
  const body = await req.json();
  const {
    id,
    title,
    description,
    type,
    priority = "medium",
    status = "future",
    start_date,
    due_date,
    recurrence,
    notes,
  } = body;

  if (!id) {
    return Response.json({ success: false, error: "Task ID is required for update." }, { status: 400 });
  }

  const query = `
    UPDATE tasks
    SET
      title = ?,
      description = ?,
      type = ?,
      priority = ?,
      status = ?,
      start_date = ?,
      due_date = ?,
      recurrence = ?,
      notes = ?
    WHERE id = ?
  `;

  const values = [
    title,
    description,
    type,
    priority,
    status,
    start_date,
    due_date,
    recurrence,
    notes,
    id,
  ];

  try {
    const result = await apiPatch(query, values);
    if (result.changes === 0) {
      return Response.json({ success: false, error: "No task was updated." }, { status: 404 });
    }
    return Response.json({ success: true, message: "Successfully updated task" }, { status: 200 });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}


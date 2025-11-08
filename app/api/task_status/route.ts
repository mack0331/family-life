import { db } from "../database";
import { apiPost, apiPatch } from "../database";
import { NextResponse } from "next/server";

// POST: Create a new task status entry
export async function POST(req: Request) {
  const { task_id, user_id, status = "future", completed_at } = await req.json();

  const query = `
    INSERT INTO task_status (task_id, user_id, status, completed_at)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await apiPost(query, [task_id, user_id, status, completed_at]);
    return NextResponse.json({ success: true, message: "Task status created" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// PATCH: Update task status for a user
export async function PATCH(req: Request) {
  const { task_id, user_id, status, completed_at } = await req.json();

  if (!task_id || !user_id) {
    return NextResponse.json({ success: false, error: "task_id and user_id are required" }, { status: 400 });
  }

  const query = `
    UPDATE task_status
    SET status = ?, updated_at = CURRENT_TIMESTAMP, completed_at = ?
    WHERE task_id = ? AND user_id = ?
  `;

  try {
    const result = await apiPatch(query, [status, completed_at, task_id, user_id]);
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: "No status was updated." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Task status updated" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET: All task statuses
export async function GET() {
  return new Promise((resolve) => {
    db.all(
      `SELECT ts.*, u.name AS user_name, t.title AS task_title
       FROM task_status ts
       JOIN users u ON ts.user_id = u.id
       JOIN tasks t ON ts.task_id = t.id`,
      [],
      (err, rows) => {
        if (err) {
          resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, statuses: rows }, { status: 200 }));
        }
      }
    );
  });
}
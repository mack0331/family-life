import { db } from "../database";
import { apiPost } from "../database";
import { NextResponse } from "next/server";

// POST: Assign a user to a task
export async function POST(req: Request) {
  const { task_id, user_id } = await req.json();

  const query = `
    INSERT INTO task_assignments (task_id, user_id)
    VALUES (?, ?)
  `;

  try {
    await apiPost(query, [task_id, user_id]);
    return NextResponse.json({ success: true, message: "User assigned to task" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// GET: All task assignments
export async function GET() {
  return new Promise((resolve) => {
    db.all(
      `SELECT ta.id, ta.task_id, ta.user_id, ta.assigned_at, u.name AS user_name, t.title AS task_title
       FROM task_assignments ta
       JOIN users u ON ta.user_id = u.id
       JOIN tasks t ON ta.task_id = t.id`,
      [],
      (err, rows) => {
        if (err) {
          resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, assignments: rows }, { status: 200 }));
        }
      }
    );
  });
}

// DELETE: Remove a task assignment
export async function DELETE(req: Request) {
  const { id } = await req.json();

  return new Promise((resolve) => {
    db.run("DELETE FROM task_assignments WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ success: true, message: "Assignment removed" }, { status: 200 }));
      }
    });
  });
}
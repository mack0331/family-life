import { apiPost, apiPatch } from "../database";
import { db } from "../database";
import { NextResponse } from "next/server";

// POST NEW USER //
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, role = "user" } = body;

  const query = `
    INSERT INTO users (name, email, role)
    VALUES (?, ?, ?)
  `;

  const values = [name, email, role];

  try {
    await apiPost(query, values);
    return NextResponse.json({ success: true, message: "Successfully created user" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// GET ALL USERS //
export async function GET() {
  return new Promise((resolve) => {
    db.all("SELECT * FROM users ORDER BY name ASC", [], (err, rows) => {
      if (err) {
        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ success: true, users: rows }, { status: 200 }));
      }
    });
  });
}

// DELETE USER //
export async function DELETE(req: Request) {
  const { id } = await req.json();

  return new Promise((resolve) => {
    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 }));
      }
    });
  });
}

// PATCH USER //
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, name, email, role = "user" } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "User ID is required for update." }, { status: 400 });
  }

  const query = `
    UPDATE users
    SET name = ?, email = ?, role = ?
    WHERE id = ?
  `;

  const values = [name, email, role, id];

  try {
    const result = await apiPatch(query, values);
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: "No user was updated." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Successfully updated user" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
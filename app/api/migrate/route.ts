import { NextResponse } from "next/server";
import { migrate } from "@/app/api/migrations"; // adjust path if needed

export async function GET() {
  try {
    migrate(); // runs the migration logic
    return NextResponse.json({ success: true, message: "Migration completed." });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, message: "Migration failed." }, { status: 500 });
  }
}
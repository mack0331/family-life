import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const searchDir = process.cwd();
  const dbFiles: string[] = [];

  function findDbFiles(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findDbFiles(fullPath);
      } else if (file.endsWith(".db")) {
        dbFiles.push(fullPath.replace(searchDir + path.sep, ""));
      }
    }
  }

  try {
    findDbFiles(searchDir);
    return NextResponse.json({ success: true, files: dbFiles });
  } catch (error) {
    console.error("Error listing .db files:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list .db files." },
      { status: 500 }
    );
  }
}
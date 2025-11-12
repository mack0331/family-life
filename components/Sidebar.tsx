"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faTasks, faUserShield } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="h-screen w-48 bg-gray-800 text-white flex flex-col p-4 space-y-6 fixed top-0 left-0">
      <h2 className="text-2xl font-bold mb-4">Team MacKay</h2>
      <nav className="flex flex-col gap-4">
        <Link href="/calendar">
          <FontAwesomeIcon icon={faCalendar} />
          <span>Calendar</span>
        </Link>

        <Link href="/tasks">
        <FontAwesomeIcon icon={faTasks} />
          <span>Tasks</span>
        </Link>

        <Link href="/admin">
        <FontAwesomeIcon icon={faUserShield} />
          <span>Admin</span>
        </Link>
      </nav>
    </div>
  );
}
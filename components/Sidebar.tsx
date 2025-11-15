"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCalendar, faTasks, faUserShield } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>

      {/* Toggle Button for Mobile */}


      {/* Sidebar */}
      <div
        className={`h-screen bg-gray-800 text-white flex flex-col p-3 space-y-6 fixed bottom-0 left-0 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-12"
        } md:translate-x-0 z-40`}
      >
        {/* Desktop Toggle Button */}
        <button
          className="text-white mb-4 hidden md:block"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Collapse Sidebar"
        >
        </button>

        
        <nav className="flex flex-col gap-4">
<Link href='/calendar'>            <FontAwesomeIcon icon={faCalendar} />
           {isOpen ? <span className="ml-2">Calendar</span> : ''}
          </Link>

          <Link href='/tasks'>
            <FontAwesomeIcon icon={faTasks} />
           {isOpen ? <span className="ml-2">Tasks</span> : ''}
          </Link>

<Link href='/admin'>            <FontAwesomeIcon icon={faUserShield} />
           {isOpen ? <span className="ml-2">Admin</span> : ''}
          </Link>
        </nav>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
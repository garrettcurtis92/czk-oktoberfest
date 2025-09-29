"use client";

import { Home, Calendar, Trophy, Menu } from "lucide-react"; // swap icons as needed
import Link from "next/link";

export default function NavDock() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60]">
      <div className="mx-auto max-w-[1400px] px-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
        <div className="rounded-2xl border border-white/20 dark:border-gray-700/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md shadow-lg nav-dock-inner flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-sm">
            <Home className="h-5 w-5" />
            <span>Teams</span>
          </Link>
          <Link href="/schedule" className="flex flex-col items-center text-sm">
            <Calendar className="h-5 w-5" />
            <span>Schedule</span>
          </Link>
          <Link href="/scores" className="flex flex-col items-center text-sm">
            <Trophy className="h-5 w-5" />
            <span>Scores</span>
          </Link>
          <Link href="/more" className="flex flex-col items-center text-sm">
            <Menu className="h-5 w-5" />
            <span>More</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
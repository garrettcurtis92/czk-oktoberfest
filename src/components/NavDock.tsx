"use client";

import {
  Home,
  Calendar,
  Trophy,
  Brackets,
  Menu,
} from "lucide-react"; // swap icons as needed
import Link from "next/link";

export default function NavDock() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60]">
      <div className="mx-auto max-w-[1400px] px-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
        <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow-lg nav-dock-inner flex justify-around py-2">
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
          <Link href="/brackets" className="flex flex-col items-center text-sm">
            <Brackets className="h-5 w-5" />
            <span>Brackets</span>
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
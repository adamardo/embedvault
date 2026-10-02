"use client";

// This needs to be a Client Component now: on a phone, the sidebar becomes a
// slide-in drawer that opens/closes, and tracking "is it open" requires
// React state (which only exists in the browser), not something a Server
// Component can do.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import {
  LayoutDashboard,
  Cpu,
  PuzzleIcon,
  BookOpen,
  Network,
  Code2,
  Wrench,
  FolderKanban,
  Star,
  NotebookPen,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Microcontrollers", href: "/knowledge/microcontrollers", icon: Cpu },
  { label: "Components", href: "/knowledge/components", icon: PuzzleIcon },
  { label: "Concepts", href: "/knowledge/concepts", icon: BookOpen },
  { label: "Protocols", href: "/knowledge/protocols", icon: Network },
  { label: "Code Library", href: "/code", icon: Code2 },
  { label: "Troubleshooting", href: "/troubleshooting", icon: Wrench },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "My Notes", href: "/notes", icon: NotebookPen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer automatically whenever you navigate to a new page —
  // without this, clicking a link on mobile would leave the drawer open,
  // covering the page you just went to.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile-only top bar: a normal sidebar has no room on a phone screen,
          so below the "lg" breakpoint we show this instead, with a button
          that opens the sidebar as an overlay. Hidden entirely on desktop. */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#12141a] px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-gray-300 hover:text-white"
        >
          <Menu size={22} />
        </button>
        <span className="text-base font-semibold tracking-tight text-white">
          Embed<span className="text-accent">Vault</span>
        </span>
        <span className="w-[22px]" /> {/* balances the menu icon so the title stays centered */}
      </div>

      {/* Backdrop: a dark overlay behind the open drawer on mobile. Tapping it
          closes the drawer, same as tapping outside any dropdown/modal. */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* The sidebar itself. On mobile it's a fixed-position drawer that
          slides in from off-screen (translate-x). On desktop ("lg" and up)
          all of that is cancelled out and it behaves like a normal sticky
          sidebar, exactly as before. */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 transform flex-col border-r border-white/10 bg-[#12141a] transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">
              Embed<span className="text-accent">Vault</span>
            </span>
            <p className="mt-0.5 text-xs text-gray-500">Embedded Engineering KB</p>
          </div>
          {/* Close button only makes sense on mobile, where the sidebar overlays the page */}
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="border-b border-white/10 px-4 py-3">
          <SearchBox size="compact" />
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

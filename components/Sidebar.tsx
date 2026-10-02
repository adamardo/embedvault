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
} from "lucide-react";

// Static nav structure for now. Once entries exist in the database (Phase 2+),
// counts/badges can be pulled in here as a server component.
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
  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-[#12141a] h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-lg font-semibold tracking-tight text-white">
          Embed<span className="text-accent">Vault</span>
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Embedded Engineering KB</p>
      </div>
      <div className="border-b border-white/10 px-4 py-3">
        <SearchBox size="compact" />
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

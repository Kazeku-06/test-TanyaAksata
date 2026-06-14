"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  HelpCircle,
  Tag,
  Users,
  Bookmark,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useMe } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const mainNav: NavItem[] = [
  { href: "/", label: "Beranda", icon: <Home className="w-4 h-4" />, exact: true },
  { href: "/questions", label: "Pertanyaan", icon: <HelpCircle className="w-4 h-4" /> },
  { href: "/tags", label: "Tag", icon: <Tag className="w-4 h-4" /> },
  { href: "/users", label: "Pengguna", icon: <Users className="w-4 h-4" /> },
  { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
];

const authNav: NavItem[] = [
  { href: "/bookmarks", label: "Bookmark", icon: <Bookmark className="w-4 h-4" /> },
];

function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname ? (item.exact ? pathname === item.href : pathname.startsWith(item.href)) : false;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
        isActive
          ? "bg-blue-100 text-[#3b82f6] font-semibold border-l-[3px] border-[#60a5fa] pl-[9px] shadow-sm"
          : "text-[#475569] hover:bg-blue-50 hover:text-[#3b82f6]"
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const { data: user } = useMe();
  const isAdmin = user?.roles?.some((r) => r.name === "admin");
  const isMod = user?.roles?.some((r) => r.name === "moderator" || r.name === "admin");

  return (
    <aside className="w-[170px] flex-shrink-0 pt-4 hidden md:block">
      <nav className="flex flex-col gap-0.5">
        {mainNav.map((item) => (
          <SidebarLink key={item.href} item={item} />
        ))}

        {user && (
          <>
            <div className="mt-5 mb-1.5 px-3 text-[10px] font-bold uppercase text-[#93c5fd] tracking-widest">
              Akun Saya
            </div>
            {authNav.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </>
        )}

        {isMod && (
          <>
            <div className="mt-5 mb-1.5 px-3 text-[10px] font-bold uppercase text-[#93c5fd] tracking-widest">
              Moderasi
            </div>
            <SidebarLink
              item={{
                href: "/moderation",
                label: "Dashboard",
                icon: <ShieldCheck className="w-4 h-4" />,
              }}
            />
          </>
        )}

        {isAdmin && (
          <>
            <div className="mt-5 mb-1.5 px-3 text-[10px] font-bold uppercase text-[#93c5fd] tracking-widest">
              Admin
            </div>
            <SidebarLink
              item={{
                href: "/admin",
                label: "Dashboard",
                icon: <LayoutDashboard className="w-4 h-4" />,
              }}
            />
          </>
        )}
      </nav>
    </aside>
  );
}

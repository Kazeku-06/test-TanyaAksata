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
  {
    href: "/",
    label: "Beranda",
    icon: <Home className="w-4 h-4" />,
    exact: true,
  },
  {
    href: "/questions",
    label: "Pertanyaan",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  { href: "/tags", label: "Tag", icon: <Tag className="w-4 h-4" /> },
  { href: "/users", label: "Pengguna", icon: <Users className="w-4 h-4" /> },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="w-4 h-4" />,
  },
];

const authNav: NavItem[] = [
  {
    href: "/bookmarks",
    label: "Bookmark",
    icon: <Bookmark className="w-4 h-4" />,
  },
];

function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-[#eff6ff] text-[#1d4ed8] border-l-4 border-[#1d4ed8] pl-[14px]"
          : "text-[#525960] hover:bg-[#f8fbff] hover:text-[#1d4ed8]",
      )}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { data: user } = useMe();
  const isAdmin = user?.roles?.some((r) => r.name === "admin");
  const isMod = user?.roles?.some(
    (r) => r.name === "moderator" || r.name === "admin",
  );

  return (
    <aside className="hidden md:block md:w-[200px] lg:w-[220px] flex-shrink-0 pt-8">
      <nav className="space-y-4 sticky top-24 bg-white/95 border border-slate-200 shadow-sm rounded-[28px] p-4 backdrop-blur-sm">
        {mainNav.map((item) => (
          <SidebarLink key={item.href} item={item} />
        ))}

        {user && (
          <>
            <div className="mt-4 mb-3 px-4 text-[11px] font-semibold uppercase text-[#525960] tracking-[0.18em]">
              Akun Saya
            </div>
            {authNav.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </>
        )}

        {isMod && (
          <>
            <div className="mt-6 mb-3 px-4 text-[11px] font-semibold uppercase text-[#525960] tracking-[0.18em]">
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
            <div className="mt-6 mb-3 px-4 text-[11px] font-semibold uppercase text-[#525960] tracking-[0.18em]">
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

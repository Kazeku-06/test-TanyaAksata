"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Bell, Menu, X, ChevronDown, Bookmark, ShieldCheck, LogOut, User } from "lucide-react";
import { useMe, useLogout } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useNotifications";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const { mutate: logout, isPending: loggingOut } = useLogout();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] shadow-md shadow-blue-900/20">
      <div className="max-w-[1264px] mx-auto px-4 h-[52px] flex items-center gap-2">

        {/* ── LEFT: Logo ── */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
            <span className="text-white font-black text-sm leading-none">TA</span>
          </div>
          <span className="font-bold text-white text-[15px] hidden sm:block tracking-tight">
            TanyaAksata
          </span>
        </Link>

        {/* ── CENTER: Search (centered with flex-1 on both sides) ── */}
        <div className="flex-1" />
        <form onSubmit={handleSearch} className="w-full max-w-[420px] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan, tag, atau topik..."
              className="w-full pl-9 pr-3 py-[7px] text-sm rounded-lg bg-white/15 text-white placeholder-blue-200/80 border border-white/10 hover:border-white/25 focus:outline-none focus:border-white/60 focus:bg-white focus:text-[#1e293b] focus:placeholder-slate-400 transition-all backdrop-blur-sm"
            />
          </div>
        </form>
        <div className="flex-1" />

        {/* ── RIGHT: Notif + Account + Mobile hamburger ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {user ? (
            <>
              {/* Notifications bell */}
              <Link
                href="/notifications"
                className={cn(
                  "relative p-2 rounded-lg transition-colors",
                  pathname === "/notifications"
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
                aria-label="Notifikasi"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors",
                    userMenuOpen
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Avatar name={user.name} avatar={user.avatar} size="xs" className="ring-2 ring-white/30" />
                  <span className="hidden md:block max-w-[90px] truncate text-sm font-medium text-white">
                    {user.name}
                  </span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-blue-200 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 w-[220px] bg-white border border-blue-100 rounded-xl shadow-xl shadow-blue-900/15 z-20 py-1 text-sm overflow-hidden">
                      {/* User header */}
                      <div className="px-4 py-3 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                        <p className="font-semibold text-[#1e293b] truncate text-[13px]">{user.name}</p>
                        <p className="text-[11px] text-blue-600 font-medium mt-0.5">{user.reputation?.toLocaleString()} reputasi</p>
                      </div>

                      <div className="py-1">
                        <DropdownLink
                          href="/profile"
                          icon={<User className="w-3.5 h-3.5" />}
                          label="Profil Saya"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <DropdownLink
                          href="/bookmarks"
                          icon={<Bookmark className="w-3.5 h-3.5" />}
                          label="Bookmark"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        {user.roles?.some((r) => r.name === "admin" || r.name === "moderator") && (
                          <DropdownLink
                            href="/moderation"
                            icon={<ShieldCheck className="w-3.5 h-3.5" />}
                            label="Moderasi"
                            onClick={() => setUserMenuOpen(false)}
                          />
                        )}
                        {user.roles?.some((r) => r.name === "admin") && (
                          <DropdownLink
                            href="/admin"
                            icon={<ShieldCheck className="w-3.5 h-3.5" />}
                            label="Admin Panel"
                            onClick={() => setUserMenuOpen(false)}
                          />
                        )}
                      </div>

                      <div className="border-t border-blue-100 pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {loggingOut ? "Keluar..." : "Keluar"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-white/30 text-blue-100 hover:bg-white/10 hover:text-white hover:border-white/50 text-[13px]">
                  Masuk
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button variant="primary" size="sm" className="bg-white text-[#2563eb] hover:bg-blue-50 border-white font-semibold text-[13px]">
                  Daftar
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-blue-200 hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-white/10 bg-[#2563eb] px-4 py-3 flex flex-col gap-0.5 text-sm shadow-inner">
          <MobileLink href="/" onClick={() => setMenuOpen(false)} active={pathname === "/"}>Beranda</MobileLink>
          <MobileLink href="/questions" onClick={() => setMenuOpen(false)} active={pathname === "/questions"}>Pertanyaan</MobileLink>
          <MobileLink href="/tags" onClick={() => setMenuOpen(false)} active={pathname === "/tags"}>Tag</MobileLink>
          <MobileLink href="/leaderboard" onClick={() => setMenuOpen(false)} active={pathname === "/leaderboard"}>Leaderboard</MobileLink>
          <MobileLink href="/users" onClick={() => setMenuOpen(false)} active={pathname === "/users"}>Pengguna</MobileLink>
          {!user && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
              <Link href="/login" className="flex-1 text-center py-2 text-sm rounded-lg border border-white/30 text-blue-100 hover:bg-white/10" onClick={() => setMenuOpen(false)}>Masuk</Link>
              <Link href="/register" className="flex-1 text-center py-2 text-sm rounded-lg bg-white text-[#2563eb] font-semibold hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Daftar</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

function DropdownLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-[#334155] hover:bg-blue-50 hover:text-[#2563eb] transition-colors"
    >
      <span className="text-[#94a3b8]">{icon}</span>
      {label}
    </Link>
  );
}

function MobileLink({ href, children, onClick, active }: { href: string; children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "py-2 px-3 rounded-lg transition-colors",
        active ? "bg-white/15 text-white font-medium" : "text-blue-200 hover:text-white hover:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
}

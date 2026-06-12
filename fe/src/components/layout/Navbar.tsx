"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Bell, Menu, X, ChevronDown } from "lucide-react";
import { useMe, useLogout } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const { mutate: logout, isPending: loggingOut } = useLogout();
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] shadow-lg shadow-blue-500/10">
      <div className="max-w-[1264px] mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <span className="text-white font-extrabold text-sm">T</span>
          </div>
          <span className="font-bold text-white text-base hidden sm:block tracking-tight">
            TanyaAksata
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[480px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-blue-400/30 rounded-lg bg-white/10 text-white placeholder-blue-300 hover:border-blue-300/60 focus:outline-none focus:border-blue-300 focus:bg-white focus:text-[#1e293b] focus:placeholder-slate-400 transition-all backdrop-blur-sm"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className={cn(
                  "p-2 rounded-lg text-white-200 hover:bg-white/10 hover:text-white relative transition-colors",
                  pathname === "/notifications" && "bg-white/15 text-white"
                )}
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 text-sm text-blue-100 transition-colors"
                >
                  <Avatar name={user.name} avatar={user.avatar} size="xs" className="ring-2 ring-blue-300/40" />
                  <span className="hidden sm:block max-w-[100px] truncate text-white">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-blue-100 rounded-xl shadow-xl shadow-blue-500/10 z-20 py-1.5 text-sm">
                      <div className="px-4 py-2.5 border-b border-blue-100 bg-blue-50/50 rounded-t-xl">
                        <p className="font-semibold text-[#1e293b] truncate">{user.name}</p>
                        <p className="text-xs text-blue-600 font-medium">{user.reputation} reputasi</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-blue-50 text-[#334155] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profil Saya
                      </Link>
                      <Link
                        href="/bookmarks"
                        className="block px-4 py-2 hover:bg-blue-50 text-[#334155] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Bookmark
                      </Link>
                      {user.roles?.some((r) => r.name === "admin" || r.name === "moderator") && (
                        <Link
                          href="/moderation"
                          className="block px-4 py-2 hover:bg-blue-50 text-[#334155] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Moderasi
                        </Link>
                      )}
                      {user.roles?.some((r) => r.name === "admin") && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 hover:bg-blue-50 text-[#334155] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      <div className="border-t border-blue-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          disabled={loggingOut}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          Keluar
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
                <Button variant="outline" size="sm" className="border-blue-300/40 text-blue-100 hover:bg-white/10 hover:text-white hover:border-blue-200">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="bg-white text-[#3b82f6] hover:bg-blue-50 border-white font-semibold">
                  Daftar
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-blue-200 hover:bg-white/10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-blue-400/20 bg-[#3b82f6] px-4 py-3 flex flex-col gap-1 text-sm">
          <Link href="/" className="py-2 text-blue-200 hover:text-white" onClick={() => setMenuOpen(false)}>
            Beranda
          </Link>
          <Link href="/questions" className="py-2 text-blue-200 hover:text-white" onClick={() => setMenuOpen(false)}>
            Pertanyaan
          </Link>
          <Link href="/leaderboard" className="py-2 text-blue-200 hover:text-white" onClick={() => setMenuOpen(false)}>
            Leaderboard
          </Link>
        </nav>
      )}
    </header>
  );
}

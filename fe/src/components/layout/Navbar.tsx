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
    <header className="sticky top-0 z-50 border-b border-[#e3e6eb] bg-[#f8f9f9] shadow-sm">
      <div className="max-w-[1264px] mx-auto px-4 h-12 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 rounded bg-[#0a95ff] flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-[#232629] text-sm hidden sm:block">
            TanyaAksata
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[480px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#babfc4]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#babfc4] rounded bg-white hover:border-[#838c95] focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className={cn(
                  "p-1.5 rounded text-[#6a737c] hover:bg-[#e3e6eb] hover:text-[#232629] relative",
                  pathname === "/notifications" && "bg-[#e3e6eb] text-[#232629]"
                )}
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#e3e6eb] text-sm text-[#3b4045]"
                >
                  <Avatar name={user.name} avatar={user.avatar} size="xs" />
                  <span className="hidden sm:block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6a737c]" />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e3e6eb] rounded shadow-lg z-20 py-1 text-sm">
                      <div className="px-3 py-2 border-b border-[#e3e6eb]">
                        <p className="font-medium text-[#232629] truncate">{user.name}</p>
                        <p className="text-xs text-[#6a737c]">{user.reputation} reputasi</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 hover:bg-[#f6f6f6] text-[#3b4045]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profil Saya
                      </Link>
                      <Link
                        href="/bookmarks"
                        className="block px-3 py-2 hover:bg-[#f6f6f6] text-[#3b4045]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Bookmark
                      </Link>
                      {user.roles?.some((r) => r.name === "admin" || r.name === "moderator") && (
                        <Link
                          href="/moderation"
                          className="block px-3 py-2 hover:bg-[#f6f6f6] text-[#3b4045]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Moderasi
                        </Link>
                      )}
                      {user.roles?.some((r) => r.name === "admin") && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 hover:bg-[#f6f6f6] text-[#3b4045]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      <div className="border-t border-[#e3e6eb] mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          disabled={loggingOut}
                          className="w-full text-left px-3 py-2 hover:bg-[#f6f6f6] text-[#c91d2e]"
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
                <Button variant="outline" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Daftar
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-1.5 rounded text-[#6a737c] hover:bg-[#e3e6eb]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-[#e3e6eb] bg-white px-4 py-2 flex flex-col gap-1 text-sm">
          <Link href="/" className="py-2 text-[#3b4045] hover:text-[#0a95ff]" onClick={() => setMenuOpen(false)}>
            Beranda
          </Link>
          <Link href="/questions" className="py-2 text-[#3b4045] hover:text-[#0a95ff]" onClick={() => setMenuOpen(false)}>
            Pertanyaan
          </Link>
          <Link href="/leaderboard" className="py-2 text-[#3b4045] hover:text-[#0a95ff]" onClick={() => setMenuOpen(false)}>
            Leaderboard
          </Link>
        </nav>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-150 backdrop-blur-md",
        isScrolled
          ? "bg-white/80 border-b border-slate-200 shadow-sm"
          : "bg-[var(--header)]/80 border-b border-transparent shadow-none",
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 rounded bg-[var(--primary)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-[var(--text-default)] text-sm hidden sm:block">
            TanyaAksata
          </span>
        </Link>

        {/* Center: Search + Ask button */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
          <form onSubmit={handleSearch} className="w-full max-w-[420px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pertanyaan..."
                className="w-full pl-12 pr-4 py-3 text-sm text-[var(--text-default)] border border-[var(--primary-light)] rounded-full bg-white shadow-sm transition-all duration-150 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]/60"
              />
            </div>
          </form>
          <Link href="/ask" className="flex-shrink-0">
            <Button variant="primary" size="md">
              Tanya
            </Button>
          </Link>
        </div>

        {/* Mobile search */}
        <form
          onSubmit={handleSearch}
          className="md:hidden flex-1 max-w-[220px]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full pl-10 pr-4 py-2 text-sm text-[var(--text-default)] border border-[var(--primary-light)] rounded-full bg-white shadow-sm transition-all duration-150 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]/60"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className={cn(
                  "p-2 rounded-2xl text-[var(--text-default)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors duration-150 relative",
                  pathname === "/notifications" &&
                    "bg-[var(--primary-light)] text-[var(--primary)]",
                )}
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-[var(--border)] bg-white text-sm text-[var(--text-default)] hover:bg-[var(--header)] transition-colors duration-150"
                >
                  <Avatar name={user.name} avatar={user.avatar} size="xs" />
                  <span className="hidden sm:block max-w-[100px] truncate text-[var(--text-default)]">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-light)]" />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e3e6eb] rounded shadow-lg z-20 py-1 text-sm">
                      <div className="px-3 py-2 border-b border-[var(--border)]">
                        <p className="font-medium text-[var(--text-default)] truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-[var(--text-light)]">
                          {user.reputation} reputasi
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 hover:bg-[var(--sidebar-bg)] text-[var(--text-default)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profil Saya
                      </Link>
                      <Link
                        href="/bookmarks"
                        className="block px-3 py-2 hover:bg-[var(--sidebar-bg)] text-[var(--text-default)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Bookmark
                      </Link>
                      {user.roles?.some(
                        (r) => r.name === "admin" || r.name === "moderator",
                      ) && (
                        <Link
                          href="/moderation"
                          className="block px-3 py-2 hover:bg-[var(--sidebar-bg)] text-[var(--text-default)]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Moderasi
                        </Link>
                      )}
                      {user.roles?.some((r) => r.name === "admin") && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 hover:bg-[var(--sidebar-bg)] text-[var(--text-default)]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      <div className="border-t border-[var(--border)] mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          disabled={loggingOut}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--sidebar-bg)] text-[var(--danger)]"
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
            className="sm:hidden p-2 rounded text-[#525960] hover:bg-[#f1f5f9]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 flex flex-col gap-3 text-sm shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-7 h-7 rounded bg-[var(--primary)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-sm text-[var(--text-default)]">
                TanyaAksata
              </span>
            </Link>
            <Link href="/ask" onClick={() => setMenuOpen(false)}>
              <Button size="sm">Tanya</Button>
            </Link>
          </div>
          <Link
            href="/"
            className="py-2 px-3 rounded-2xl text-[var(--text-default)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition duration-200"
            onClick={() => setMenuOpen(false)}
          >
            Beranda
          </Link>
          <Link
            href="/questions"
            className="py-2 px-3 rounded-2xl text-[var(--text-default)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition duration-200"
            onClick={() => setMenuOpen(false)}
          >
            Pertanyaan
          </Link>
          <Link
            href="/leaderboard"
            className="py-2 text-[var(--text-default)] hover:text-[var(--primary)] rounded"
            onClick={() => setMenuOpen(false)}
          >
            Leaderboard
          </Link>
        </nav>
      )}
    </header>
  );
}

import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";

const footerLinks = {
  navigasi: [
    { href: "/", label: "Beranda" },
    { href: "/questions", label: "Pertanyaan" },
    { href: "/search", label: "Pencarian" },
    { href: "/tags", label: "Tag" },
    { href: "/leaderboard", label: "Leaderboard" },
  ],
  komunitas: [
    { href: "/bookmarks", label: "Bookmark" },
    { href: "/notifications", label: "Notifikasi" },
    { href: "/profile", label: "Profil" },
    { href: "/users", label: "Pengguna" },
  ],
  informasi: [
    { href: "/terms", label: "Syarat & Ketentuan" },
    { href: "/privacy", label: "Kebijakan Privasi" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0f2744] text-white mt-auto w-full">
      <div className="max-w-[1264px] mx-auto px-6 pt-8 pb-5">

        {/* Top section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">

          {/* Brand — spans 2 cols on md+ */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-md shadow-blue-900/30">
                <MessageCircle className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">TanyaAksata</span>
            </Link>
            <p className="text-sm text-blue-300/70 leading-relaxed max-w-[280px]">
              Komunitas tanya jawab pengembang Indonesia. Bertanya, berbagi, dan belajar bersama.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-blue-400">Navigasi</h4>
            <ul className="flex flex-col gap-1.5 text-sm">
              {footerLinks.navigasi.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-200/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Komunitas */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-blue-400">Komunitas</h4>
            <ul className="flex flex-col gap-1.5 text-sm">
              {footerLinks.komunitas.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-200/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-blue-400">Informasi</h4>
            <ul className="flex flex-col gap-1.5 text-sm">
              {footerLinks.informasi.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-200/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

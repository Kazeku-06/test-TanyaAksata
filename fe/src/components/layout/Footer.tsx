import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto border-t border-white/10 w-full">
      <div className="max-w-[1264px] mx-auto px-6 py-5"> {/* Mengurangi padding atas-bawah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-5">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 mb-1.5 group text-white hover:text-white decoration-transparent">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-white tracking-tight">TanyaAksata</span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-[240px]"> {/* Perkecil teks deskripsi */}
              Komunitas tanya jawab pengembang Indonesia. Bertanya, berbagi, dan belajar bersama.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-white/100">Navigasi</h4>
            <ul className="flex flex-col gap-1 text-xs"> {/* Jarak link lebih rapat & kecil */}
              <li><Link href="/" className="text-white/70 hover:text-white transition-colors block py-0.5">Beranda</Link></li>
              <li><Link href="/questions" className="text-white/70 hover:text-white transition-colors block py-0.5">Pertanyaan</Link></li>
              <li><Link href="/search" className="text-white/70 hover:text-white transition-colors block py-0.5">Pencarian</Link></li>
              <li><Link href="/leaderboard" className="text-white/70 hover:text-white transition-colors block py-0.5">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Komunitas */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-white/100">Komunitas</h4>
            <ul className="flex flex-col gap-1 text-xs">
              <li><Link href="/bookmarks" className="text-white/70 hover:text-white transition-colors block py-0.5">Bookmark</Link></li>
              <li><Link href="/notifications" className="text-white/70 hover:text-white transition-colors block py-0.5">Notifikasi</Link></li>
              <li><Link href="/profile" className="text-white/70 hover:text-white transition-colors block py-0.5">Profil</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-white/100">Informasi</h4>
            <ul className="flex flex-col gap-1 text-xs">
              <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors block py-0.5">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors block py-0.5">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider & copyright */}
        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/100">
            &copy; 2026 TanyaAksata. All rights reserved.
          </p>
          <p className="text-[11px] text-white/40 flex items-center gap-1">
            Built with <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" /> in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
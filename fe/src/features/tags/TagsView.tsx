import Link from "next/link";
import type { Tag } from "@/types";
import { Search, AlertCircle, Hash } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Input from "@/components/ui/Input";

type TagWithCount = Tag & { posts_count: number };

const TAG_DESCRIPTIONS: Record<string, string> = {
  javascript:  "Bahasa pemrograman web paling populer di sisi klien dan server.",
  typescript:  "Superset JavaScript dengan sistem tipe statis.",
  react:       "Library UI berbasis komponen dari Meta.",
  nextjs:      "Framework React untuk aplikasi web full-stack.",
  vue:         "Framework JavaScript progresif untuk membangun UI.",
  laravel:     "Framework PHP elegan untuk aplikasi web modern.",
  php:         "Bahasa scripting server-side yang luas digunakan.",
  python:      "Bahasa pemrograman serbaguna yang mudah dipelajari.",
  mysql:       "Sistem manajemen database relasional open-source.",
  postgresql:  "Database relasional open-source yang powerful.",
  css:         "Bahasa styling untuk tampilan halaman web.",
  html:        "Bahasa markup standar untuk struktur halaman web.",
  api:         "Antarmuka pemrograman untuk komunikasi antar sistem.",
  node:        "Runtime JavaScript di sisi server berbasis V8.",
  nodejs:      "Runtime JavaScript di sisi server berbasis V8.",
  docker:      "Platform containerisasi untuk deploy aplikasi.",
  git:         "Sistem version control terdistribusi yang populer.",
  tailwind:    "Framework CSS utility-first untuk desain cepat.",
  express:     "Framework web minimalis untuk Node.js.",
  mongodb:     "Database NoSQL berorientasi dokumen.",
  redis:       "Penyimpanan data in-memory berkecepatan tinggi.",
  aws:         "Platform cloud computing dari Amazon.",
  linux:       "Sistem operasi open-source berbasis Unix.",
  android:     "Platform mobile dari Google berbasis Linux.",
  flutter:     "Framework UI cross-platform dari Google.",
  kotlin:      "Bahasa pemrograman modern untuk Android & JVM.",
  java:        "Bahasa pemrograman berorientasi objek yang portabel.",
};

function getTagDescription(name: string): string {
  return TAG_DESCRIPTIONS[name.toLowerCase()] ?? `Pertanyaan seputar topik ${name}.`;
}

interface TagsViewProps {
  tags: TagWithCount[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  search: string;
  currentPage: number;
  lastPage: number;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
}

export default function TagsView({
  tags,
  total,
  isLoading,
  isError,
  search,
  currentPage,
  lastPage,
  onSearchChange,
  onPageChange,
}: TagsViewProps) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#232629] tracking-tight">Tag</h1>
            {!isLoading && (
              <p className="text-sm text-[#525960] mt-1">
                <span className="font-semibold text-[#232629]">{total}</span> tag tersedia
              </p>
            )}
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Cari tag..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#c91d2e]">
          <AlertCircle className="w-4 h-4" />
          Gagal memuat tag. Coba refresh halaman.
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <Hash className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <p className="font-semibold text-[#232629] mb-1">
            {search ? `Tidak ada tag "${search}"` : "Belum ada tag"}
          </p>
          <p className="text-sm text-[#525960]">
            {search ? "Coba kata kunci lain." : "Tag akan muncul saat postingan dibuat."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/questions?tag=${tag.name}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <Hash className="w-4 h-4" />
              </div>
              <p className="font-semibold text-sm text-[#232629] truncate group-hover:text-[var(--primary)] transition-colors">
                {tag.name}
              </p>
              <p className="text-xs text-[#525960] line-clamp-2 leading-relaxed">
                {getTagDescription(tag.name)}
              </p>
              <p className="text-xs text-[#525960] mt-auto pt-2 border-t border-slate-100">
                <span className="font-bold text-[#232629]">{tag.posts_count}</span> pertanyaan
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && !isLoading && (
        <div className="flex justify-center pt-4 border-t border-[#e3e6eb]">
          <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePost, useLikePost, useDeletePost, useUserPostLike } from "@/hooks/usePosts";
import { useMe } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import ReportButton from "./ReportButton"; // Sesuaikan path ini dengan struktur folder Anda
import { CheckCircle, Clock, Eye, Pencil, ThumbsUp, Trash2 } from "lucide-react";

interface PostDetailProps {
  postId: string;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const { data: post, isLoading } = usePost(postId);
  const { data: me } = useMe();
  const { data: likeData } = useUserPostLike(postId, !!me);
  const { mutate: like } = useLikePost(postId);
  const { mutate: deletePost, isPending: deleting } = useDeletePost();

  const isLiked = likeData?.is_liked ?? false;
  const isOwner = !!me && !!post && me.id === post.user_id;
  const canModerate = !!me?.roles?.some((role) => role.name === "admin" || role.name === "moderator");

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    deletePost(postId, {
      onSuccess: () => router.replace("/"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e] font-medium max-w-[1100px] mx-auto mt-6">
        Pertanyaan tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 py-6 font-sans text-[#232629] bg-white">

      {/* 1. HEADER UTAMA (Judul & Tombol Ask Question) */}
      <div className="border-b border-[#e3e6eb] pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-normal text-[#232629] leading-snug flex-1">
            {post.is_solved && (
              <CheckCircle className="inline w-5 h-5 text-[#2e6d44] mr-1.5 mb-0.5" />
            )}
            {post.title}
          </h1>
          <Link
            href="/questions/ask"
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded shadow-sm transition whitespace-nowrap self-start"
          >
            Ask Question
          </Link>
        </div>

        {/* Metadata di bawah judul */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#525960] mt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Ditanyakan <span className="text-[#232629] font-medium">{timeAgo(post.created_at)}</span>
          </span>
          {post.is_edited && (
            <span className="flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" />
              Diedit
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Dilihat <span className="text-[#232629] font-medium">{formatCount(post.views_count)} kali</span>
          </span>
        </div>
      </div>

      {/* 2. AREA UTAMA: KIRI (VOTES) & KANAN (KONTEN) */}
      <div className="grid grid-cols-[auto_1fr] gap-4">

        {/* Sisi Kiri: Tampilan Skor / Vote */}
        <div className="flex flex-col items-center gap-1 w-12 pt-1 text-[#6a737c]">
          <span className="text-2xl font-semibold text-[#232629] leading-none">
            {post.votes_count}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[#9199a1]">votes</span>
        </div>

        {/* Sisi Kanan: Isi Markdown/HTML Pertanyaan & Aksi */}
        <div className="flex flex-col justify-between min-w-0">

          {/* Isi Deskripsi Pertanyaan */}
          <div
            className="text-[15px] leading-relaxed break-words whitespace-pre-wrap mb-6 prose max-w-none text-[#232629]"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Deretan Tag */}
          <div className="flex flex-wrap gap-1 mb-6">
            {post.tags?.map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d]"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* BARIS AKSI BAWAH */}
          <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-[#f1f2f3]">

            {/* Navigasi Aksi Kiri (Share, Edit, Report) */}
            <div className="flex items-center gap-3 text-[13px]">
              <button type="button" className="text-[#6a737c] hover:text-[#0a95ff] transition-colors">
                Bagikan
              </button>
              <button type="button" className="text-[#6a737c] hover:text-[#0a95ff] transition-colors">
                Edit
              </button>

              {/* ⚠️ PANGGIL LANGSUNG TANPA DIBUNGKUS <Link> ATAU <a> */}
              <ReportButton targetType="post" targetId={post.id} />
            </div>

            {/* SISI KANAN KONTEN: Body text, Tags, Actions & Author Card */}
            <div className="flex-1 min-w-0">
              {/* Isi Pertanyaan */}
              <div className="prose max-w-none text-[15px] text-[#232629] leading-relaxed mb-6 whitespace-pre-wrap">
                {post.body}
              </div>

              {/* Tags Layout */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/questions?tag=${tag.name}`}
                      className="px-1.5 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#0059a1] hover:bg-[#d0e3f0] transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Baris Tombol Aksi & Kartu User */}
              <div className="flex flex-wrap items-start justify-between gap-4 pt-4 border-t border-[#e3e6eb]">
                {/* Tombol aksi kiri */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#525960] font-medium pt-1">
                  <button
                    onClick={() => like()}
                    disabled={!me || isOwner}
                    className={cn(
                      "flex items-center gap-1 hover:text-[var(--primary)] transition-colors",
                      isLiked ? "text-[var(--primary)] font-medium" : "text-[#525960]",
                      !me && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <ThumbsUp className={cn("w-3.5 h-3.5", isLiked && "fill-[var(--primary)]")} />
                    <span>{isLiked ? "Menyukai" : "Suka"}</span>
                    {post.likes_count > 0 && (
                      <span className={cn("font-semibold", isLiked ? "text-[var(--primary)]" : "text-[#232629]")}>
                        ({post.likes_count})
                      </span>
                    )}
                  </button>

                  <ReportButton targetType="post" targetId={post.id} />

                  {(isOwner || canModerate) && (
                    <>
                      <Link
                        href={`/questions/${post.id}/edit`}
                        className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-1 hover:text-[#c91d2e] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </>
                  )}
                </div>

                {/* Kartu Profil Pembuat (Khas Kotak Kuning-Biru SO) */}
                <div className="bg-[#e1ecf4] border border-[#d0e3f0] rounded p-3 w-52 text-xs self-end">
                  <span className="text-[#525960] block mb-1.5 text-[11px]">
                    ditanyakan {timeAgo(post.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Avatar name={post.user.name} avatar={post.user.avatar} size="sm" />
                    <div className="min-w-0">
                      <Link
                        href={`/users/${post.user.id}`}
                        className="text-[var(--text-link)] hover:underline font-medium text-xs block truncate"
                      >
                        {post.user.name}
                      </Link>
                      <span className="text-[11px] font-bold text-[#525960]">
                        {post.user.reputation} <span className="font-normal text-[#9199a1]">rep</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* KOLOM KANAN (Sidebar - Lebar 1/4 halaman di desktop) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Box Aturan/Info Kuning ala Stack Overflow */}
          <div className="bg-[#fdf7e2] border border-[#f1e5bc] rounded text-xs text-[#3b3a36]">
            <div className="bg-[#fbf3d5] px-3 py-2 font-bold border-b border-[#f1e5bc] text-[#232629]">
              The Overflow Blog
            </div>
            <ul className="p-3 space-y-2.5 list-disc list-inside text-[#3b3a36]">
              <li className="hover:underline cursor-pointer">Panduan menulis pertanyaan yang baik dan mudah dipahami.</li>
              <li className="hover:underline cursor-pointer">Mengapa reputasi poin itu penting di dalam forum?</li>
            </ul>
          </div>

          {/* Box Informasi Tambahan */}
          <div className="border border-[#e3e6eb] rounded p-4 text-xs">
            <h3 className="font-semibold text-[#232629] mb-3 text-[13px]">Aturan Forum</h3>
            <p className="text-[#525960] leading-relaxed">
              Pastikan sebelum bertanya kamu sudah melakukan pencarian terlebih dahulu agar tidak terjadi duplikasi pertanyaan. Jaga kesantunan dalam berdiskusi.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
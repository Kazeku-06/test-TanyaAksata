"use client";

import {
  usePost,
  useVotePost,
  useLikePost,
  useBookmarkPost,
  useDeletePost,
  useUserPostVote,
  useUserPostLike,
} from "@/hooks/usePosts";
import { useMe } from "@/hooks/useAuth";
import CommentList from "@/components/comment/CommentList";
import VoteButton from "./VoteButton";
import ReportButton from "./ReportButton";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  Pencil,
  Trash2,
  Clock,
  Eye,
  CheckCircle,
} from "lucide-react";
import { timeAgo, formatCount, cn } from "@/lib/utils";

interface PostDetailClientProps {
  postId: string;
}

export default function PostDetailClient({ postId }: PostDetailClientProps) {
  const router = useRouter();
  const { data: post, isLoading, isError } = usePost(postId);
  const { data: me } = useMe();
  const { mutate: vote } = useVotePost(postId);
  const { mutate: like } = useLikePost(postId);
  const { mutate: bookmark } = useBookmarkPost(postId);
  const { mutate: deletePost, isPending: deleting } = useDeletePost();

  const { data: userVoteData } = useUserPostVote(postId, !!me);
  const { data: userLikeData } = useUserPostLike(postId, !!me);

  const userVote = userVoteData?.user_vote ?? null;
  const isLiked = userLikeData?.is_liked ?? false;

  const isOwner = me?.id === post?.user_id;
  const canModerate = me?.roles?.some(
    (r) => r.name === "admin" || r.name === "moderator"
  );

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    deletePost(postId, {
      onSuccess: () => router.replace("/"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-[#c91d2e] font-medium mb-2">Pertanyaan tidak ditemukan.</p>
        <Link href="/" className="text-[#0074cc] text-sm hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-[#232629]">
      
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
            className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-4 py-2.5 rounded shadow-sm transition whitespace-nowrap self-start"
          >
            Ask Question
          </Link>
        </div>

        {/* Metadata di bawah judul */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6a737c] mt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Ditanyakan <span className="text-[#232629]">{timeAgo(post.created_at)}</span>
          </span>
          {post.is_edited && (
            <span className="flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" />
              Diedit
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Dilihat <span className="text-[#232629]">{formatCount(post.views_count)} kali</span>
          </span>
        </div>
      </div>

      {/* 2. DUA KOLOM LAYOUT (Konten Kiri + Sidebar Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KOLOM KIRI (Lebar 3/4 halaman di desktop) */}
        <div className="lg:col-span-3">
          <div className="flex gap-4">
            
            {/* SISI KIRI KONTEN: Vote & Bookmark */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2 w-12 text-[#babfc4]">
              <VoteButton
                count={post.votes_count}
                userVote={userVote}
                onVote={(v) => vote(v)}
                disabled={!me || isOwner}
              />

              {/* Bookmark Button */}
              <button
                onClick={() => bookmark()}
                disabled={!me}
                aria-label={post.is_bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
                className={cn(
                  "p-1 rounded transition-colors mt-1 hover:bg-gray-50",
                  post.is_bookmarked
                    ? "text-[#f48024]"
                    : "text-[#babfc4] hover:text-[#6a737c]",
                  !me && "opacity-40 cursor-not-allowed"
                )}
              >
                {post.is_bookmarked ? (
                  <BookmarkCheck className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Bookmark className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
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
                      className="px-1.5 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d] hover:bg-[#d0e3f0] transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Baris Tombol Aksi & Kartu User */}
              <div className="flex flex-wrap items-start justify-between gap-4 pt-4 border-t border-[#e3e6eb]">
                {/* Tombol aksi kiri */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6a737c] font-medium pt-1">
                  <button
                    onClick={() => like()}
                    disabled={!me || isOwner}
                    className={cn(
                      "flex items-center gap-1 hover:text-[#0a95ff] transition-colors",
                      isLiked ? "text-[#0a95ff] font-medium" : "text-[#6a737c]",
                      !me && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <ThumbsUp className={cn("w-3.5 h-3.5", isLiked && "fill-[#0a95ff]")} />
                    <span>{isLiked ? "Menyukai" : "Suka"}</span>
                    {post.likes_count > 0 && (
                      <span className={cn("font-semibold", isLiked ? "text-[#0a95ff]" : "text-gray-700")}>
                        ({post.likes_count})
                      </span>
                    )}
                  </button>

                  <ReportButton targetType="post" targetId={post.id} />

                  {(isOwner || canModerate) && (
                    <>
                      <Link
                        href={`/questions/${post.id}/edit`}
                        className="flex items-center gap-1 hover:text-[#0a95ff] transition-colors"
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
                  <span className="text-[#6a737c] block mb-1.5 text-[11px]">
                    ditanyakan {timeAgo(post.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Avatar name={post.user.name} avatar={post.user.avatar} size="sm" />
                    <div className="min-w-0">
                      <Link
                        href={`/users/${post.user.id}`}
                        className="text-[#0074cc] hover:underline font-medium text-xs block truncate"
                      >
                        {post.user.name}
                      </Link>
                      <span className="text-[11px] font-bold text-[#6a737c]">
                        {post.user.reputation} <span className="font-normal text-gray-400">rep</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIST KOMENTAR */}
              <div className="mt-6 border-t border-[#e3e6eb] pt-4">
                <CommentList postId={post.id} postOwnerId={post.user_id} />
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
            <p className="text-[#6a737c] leading-relaxed">
              Pastikan sebelum bertanya kamu sudah melakukan pencarian terlebih dahulu agar tidak terjadi duplikasi pertanyaan. Jaga kesantunan dalam berdiskusi.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
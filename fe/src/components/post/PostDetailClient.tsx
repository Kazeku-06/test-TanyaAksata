"use client";

import { usePost } from "@/hooks/usePosts";
import Spinner from "@/components/ui/Spinner";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import ReportButton from "./ReportButton"; // Sesuaikan path ini dengan struktur folder Anda
import { CheckCircle } from "lucide-react";

interface PostDetailProps {
  postId: string;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const { data: post, isLoading } = usePost(postId);

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
      
      {/* 1. HEADER PERTANYAAN (Gaya Stack Overflow) */}
      <div className="border-b border-[#e3e6eb] pb-4 mb-4">
        <h1 className="text-2xl font-normal text-[#232629] mb-2 break-words flex items-center gap-2">
          {post.is_solved && (
            <CheckCircle className="w-6 h-6 text-[#2e6d44] flex-shrink-0" />
          )}
          {post.title}
        </h1>
        
        {/* Info Meta Sub-Header */}
        <div className="flex flex-wrap gap-4 text-xs text-[#6a737c]">
          <span>
            Dibuat <span className="text-[#232629]">{timeAgo(post.created_at)}</span>
          </span>
          <span>
            Dilihat <span className="text-[#232629]">{post.views_count.toLocaleString()} kali</span>
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

            {/* Kartu Profil Pembuat (Sebelah Kanan Bawah) */}
            <div className="bg-[#e1ecf4] rounded-sm p-3 w-[200px] text-xs text-[#6a737c] border border-[#d6d9dc]/30">
              <p className="text-[11px] text-[#6a737c] mb-1.5">
                ditanyakan {timeAgo(post.created_at)}
              </p>
              <div className="flex items-center gap-2">
                <Avatar name={post.user.name} avatar={post.user.avatar} size="xs" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[#0074cc] hover:text-[#0a95ff] font-medium block truncate">
                    {post.user.name}
                  </span>
                  <span className="text-[#9199a1] font-bold text-[11px]">
                    {post.user.reputation?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
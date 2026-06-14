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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-[#dc2626] font-medium max-w-[1100px] mx-auto mt-6">
        Pertanyaan tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 py-6 font-sans text-[#1e293b] bg-white">
      
      {/* 1. HEADER PERTANYAAN */}
      <div className="border-b border-blue-200 pb-4 mb-4">
        <h1 className="text-2xl font-normal text-[#1e293b] mb-2 break-words flex items-center gap-2">
          {post.is_solved && (
            <CheckCircle className="w-6 h-6 text-[#059669] flex-shrink-0" />
          )}
          {post.title}
        </h1>
        
        {/* Info Meta Sub-Header */}
        <div className="flex flex-wrap gap-4 text-xs text-[#64748b]">
          <span>
            Dibuat <span className="text-[#1e293b]">{timeAgo(post.created_at)}</span>
          </span>
          <span>
            Dilihat <span className="text-[#1e293b]">{post.views_count.toLocaleString()} kali</span>
          </span>
        </div>
      </div>

      {/* 2. AREA UTAMA: KIRI (VOTES) & KANAN (KONTEN) */}
      <div className="grid grid-cols-[auto_1fr] gap-4">
        
        {/* Sisi Kiri: Tampilan Skor / Vote */}
        <div className="flex flex-col items-center gap-1 w-12 pt-1 text-[#64748b]">
          <span className="text-2xl font-semibold text-[#1e293b] leading-none">
            {post.votes_count}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[#94a3b8]">votes</span>
        </div>

        {/* Sisi Kanan: Isi Markdown/HTML Pertanyaan & Aksi */}
        <div className="flex flex-col justify-between min-w-0">
          
          {/* Isi Deskripsi Pertanyaan */}
          <div 
            className="text-[15px] leading-relaxed break-words whitespace-pre-wrap mb-6 prose max-w-none text-[#1e293b]"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Deretan Tag */}
          <div className="flex flex-wrap gap-1 mb-6">
            {post.tags?.map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 text-xs rounded border border-blue-200 bg-blue-50 text-[#60a5fa]"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* BARIS AKSI BAWAH */}
          <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-blue-100">
            
            {/* Navigasi Aksi Kiri (Share, Edit, Report) */}
            <div className="flex items-center gap-3 text-[13px]">
              <button type="button" className="text-[#64748b] hover:text-[#60a5fa] transition-colors">
                Bagikan
              </button>
              <button type="button" className="text-[#64748b] hover:text-[#60a5fa] transition-colors">
                Edit
              </button>
              
              {/* PANGGIL LANGSUNG TANPA DIBUNGKUS <Link> ATAU <a> */}
              <ReportButton targetType="post" targetId={post.id} />
            </div>

            {/* Kartu Profil Pembuat (Sebelah Kanan Bawah) */}
            <div className="bg-blue-50 rounded-lg p-3 w-[200px] text-xs text-[#64748b] border border-blue-100">
              <p className="text-[11px] text-[#64748b] mb-1.5">
                ditanyakan {timeAgo(post.created_at)}
              </p>
              <div className="flex items-center gap-2">
                <Avatar name={post.user.name} avatar={post.user.avatar} size="xs" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[#60a5fa] hover:text-[#3b82f6] font-medium block truncate">
                    {post.user.name}
                  </span>
                  <span className="text-[#94a3b8] font-bold text-[11px]">
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

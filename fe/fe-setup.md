---
inclusion: manual
---

# Frontend Setup — TanyaAksata

## Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 — tema biru/putih, style Stack Overflow
- **State management**: TanStack React Query v5
- **HTTP client**: Axios (dengan interceptor token Sanctum)
- **Auth token**: disimpan di cookie `auth_token` (js-cookie)
- **Icons**: lucide-react
- **Utilities**: clsx + tailwind-merge → helper `cn()`

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/           # Halaman tanpa sidebar (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (main)/           # Halaman dengan layout utama
│   │   ├── questions/
│   │   │   ├── page.tsx          # Daftar semua pertanyaan
│   │   │   ├── ask/              # Form ajukan pertanyaan
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detail pertanyaan
│   │   │       └── edit/         # Edit pertanyaan
│   │   ├── search/               # Halaman pencarian
│   │   ├── profile/              # Edit profil sendiri
│   │   ├── users/                # Daftar & profil user
│   │   ├── bookmarks/
│   │   ├── notifications/
│   │   ├── leaderboard/
│   │   ├── tags/
│   │   ├── moderation/           # Moderator & admin
│   │   └── admin/
│   ├── layout.tsx                # Root layout + Providers
│   └── page.tsx                  # Home (PostList)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Header sticky
│   │   ├── Sidebar.tsx           # Sidebar kiri (nav)
│   │   ├── RightSidebar.tsx      # Sidebar kanan (widget)
│   │   └── MainLayout.tsx        # Wrapper layout utama
│   ├── ui/                       # Komponen atom
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── Pagination.tsx
│   ├── post/
│   │   ├── PostCard.tsx          # Card di list
│   │   ├── PostList.tsx          # List + tabs latest/trending
│   │   ├── PostDetailClient.tsx  # Detail + vote + bookmark
│   │   ├── AskQuestionForm.tsx   # Form buat pertanyaan
│   │   ├── EditPostClient.tsx    # Form edit pertanyaan
│   │   ├── VoteButton.tsx        # Tombol vote up/down
│   │   └── ReportButton.tsx      # Modal laporan
│   ├── comment/
│   │   ├── CommentList.tsx       # Daftar + form jawaban
│   │   ├── CommentItem.tsx       # Item komentar + reply
│   │   └── CommentForm.tsx       # Form komentar/reply
│   └── user/
│       ├── UserCard.tsx          # Card user di grid/list
│       ├── UserProfileClient.tsx # Halaman profil publik
│       └── ReputationBadge.tsx   # Badge level reputasi
│
├── hooks/                        # API hooks (React Query)
│   ├── useAuth.ts                # login, register, logout, useMe
│   ├── usePosts.ts               # CRUD post, vote, like, bookmark
│   ├── useComments.ts            # CRUD comment, accept, vote, like
│   ├── useProfile.ts             # profil, follow, badges
│   ├── useNotifications.ts       # notifikasi + unread count
│   ├── useBookmarks.ts           # list + hapus bookmark
│   └── useCategories.ts          # list & detail kategori
│
├── lib/
│   ├── axios.ts                  # Axios instance + interceptor
│   ├── queryClient.ts            # QueryClient config
│   └── utils.ts                  # cn(), timeAgo(), formatCount(), dll
│
└── types/
    └── index.ts                  # Semua TypeScript types dari API
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

## Warna Utama (CSS Variables)

| Variabel | Nilai | Digunakan untuk |
|---|---|---|
| `--primary` | `#0a95ff` | Button primary, link, border focus |
| `--primary-hover` | `#0074cc` | Hover state |
| `--primary-light` | `#e1ecf4` | Background tag, secondary button |
| `--border` | `#e3e6eb` | Border default |
| `--text-default` | `#232629` | Teks utama |
| `--text-light` | `#6a737c` | Teks sekunder |

## Cara Jalankan

```bash
cd fe
npm install
cp .env.example .env.local
# Edit .env.local sesuai URL BE
npm run dev
```

## Konvensi Koding

- Semua komponen interaktif → `"use client"` di baris pertama
- Server components untuk halaman statis / `page.tsx` yang tidak butuh state
- Semua fetch data lewat hooks di `src/hooks/`
- Error handling konsisten: tangkap dari `err.response.data.errors` (Laravel validation) atau fallback ke `getErrorMessage(err)`
- Gunakan `cn()` dari `@/lib/utils` untuk conditional Tailwind classes
- Prefer komponen atom (`Button`, `Input`, dll) daripada styling inline berulang

---
inclusion: manual
---

# Frontend Setup — TanyaAksata

## Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 — tema biru/putih, style Stack Overflow
- **State management**: TanStack React Query v5
- **Form**: React Hook Form + Zod (`@hookform/resolvers/zod`)
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
│   │   ├── AskQuestionForm.tsx   # Form buat pertanyaan (RHF + Zod)
│   │   ├── EditPostClient.tsx    # Form edit pertanyaan (RHF + Zod)
│   │   ├── VoteButton.tsx        # Tombol vote up/down
│   │   └── ReportButton.tsx      # Modal laporan (RHF + Zod)
│   ├── comment/
│   │   ├── CommentList.tsx       # Daftar + form jawaban
│   │   ├── CommentItem.tsx       # Item komentar + reply
│   │   └── CommentForm.tsx       # Form komentar/reply (RHF + Zod)
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
│   ├── useCategories.ts          # list & detail kategori
│   ├── useLeaderboard.ts         # ranking user
│   ├── useModeration.ts          # trashed, history, reports, warn/ban/unban
│   └── useAdmin.ts               # users/roles, statistik, trend, kategori CRUD
│
├── lib/
│   ├── axios.ts                  # Axios instance + interceptor
│   ├── queryClient.ts            # QueryClient config
│   ├── schemas.ts                # Semua Zod schemas + inferred types
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

## Konvensi Form (React Hook Form + Zod)

### Pola Standar

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mySchema, type MyFormData } from "@/lib/schemas";

const { register, handleSubmit, setError, formState: { errors } } =
  useForm<MyFormData>({ resolver: zodResolver(mySchema) });

function onSubmit(data: MyFormData) {
  mutate(data, {
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const apiErrors = axiosErr?.response?.data?.errors;
      if (apiErrors) {
        // Map Laravel validation errors ke field
        for (const [key, messages] of Object.entries(apiErrors)) {
          setError(key as keyof MyFormData, { message: messages[0] });
        }
      } else {
        // Fallback: tampilkan di errors.root
        setError("root", { message: axiosErr?.response?.data?.message || "Terjadi kesalahan" });
      }
    },
  });
}
```

### Aturan
- Selalu tambahkan `noValidate` pada `<form>` untuk disable browser default validation
- Gunakan `Controller` dari RHF untuk element non-native (`<select>`, custom components)
- Gunakan `reset(data)` di `useEffect` untuk pre-fill form dari data fetched
- Error global (non-field) tampil via `errors.root?.message`
- Semua schemas disimpan di `src/lib/schemas.ts` — jangan buat schema inline di komponen

### Semua Schemas

| Schema | Form / Komponen |
|--------|----------------|
| `loginSchema` | `/login` |
| `registerSchema` | `/register` |
| `createPostSchema` | `AskQuestionForm` |
| `updatePostSchema` | `EditPostClient` |
| `createCommentSchema` | `CommentForm` |
| `updateCommentSchema` | edit komentar inline |
| `updateProfileSchema` | `/profile` |
| `createReportSchema` | `ReportButton` |
| `warnUserSchema` | moderation — warn user |
| `banUserSchema` | moderation — ban user |
| `resolveReportSchema` | moderation/admin — resolve report |

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
- Gunakan `cn()` dari `@/lib/utils` untuk conditional Tailwind classes
- Prefer komponen atom (`Button`, `Input`, dll) daripada styling inline berulang
- Semua Zod schemas dan inferred types ada di `src/lib/schemas.ts`
- Lihat `PAGES.md` untuk referensi lengkap halaman, fitur, dan endpoint

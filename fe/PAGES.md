# TanyaAksata — Halaman, Fitur & Endpoint

> Base URL: `http://localhost:8000/api/v1`  
> Auth: `Authorization: Bearer {token}` (Laravel Sanctum, disimpan di cookie `auth_token`)  
> Form: React Hook Form + Zod (`src/lib/schemas.ts`)  
> Logic/View dipisah di `src/features/`

---

## Ringkasan Semua Halaman

| # | Route | Feature Folder | Auth | Role |
|---|-------|---------------|------|------|
| 1 | `/` | `features/home` | Public | — |
| 2 | `/questions` | `features/questions` | Public | — |
| 3 | `/questions/[id]` | `features/questions` | Public (aksi butuh login) | — |
| 4 | `/questions/ask` | `features/questions` | 🔒 Login | — |
| 5 | `/questions/[id]/edit` | `features/questions` | 🔒 Login (pemilik/mod/admin) | — |
| 6 | `/search` | `features/search` | Public | — |
| 7 | `/users/[id]` | `features/userProfile` | Public (aksi butuh login) | — |
| 8 | `/profile` | `features/profile` | 🔒 Login | — |
| 9 | `/users` | — | Public | — |
| 10 | `/bookmarks` | `features/bookmarks` | 🔒 Login | — |
| 11 | `/notifications` | `features/notifications` | 🔒 Login | — |
| 12 | `/leaderboard` | `features/leaderboard` | Public | — |
| 13 | `/tags` | — | Public | — |
| 14 | `/login` | `features/auth/login` | Guest | — |
| 15 | `/register` | `features/auth/register` | Guest | — |
| 16 | `/moderation` | `features/moderation` | 🔒 Login | admin / moderator |
| 17 | `/admin` | `features/admin` | 🔒 Login | admin |

---

## 1. Home / Feed

**Route:** `/`  
**Files:** `src/app/page.tsx` → `HomeLogic.tsx` → `HomeView.tsx`

### Fitur
- Daftar post terbaru dengan paginasi (10/hal)
- Tab switch: Terbaru / Trending
- Sidebar kanan: widget "Ajukan Pertanyaan" + tag populer
- Tombol "Ajukan Pertanyaan"

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts?page={n}` | Daftar post terbaru |
| `GET` | `/posts/trending?limit={n}` | Post trending 7 hari |
| `GET` | `/categories` | Kategori untuk sidebar |

---

## 2. Semua Pertanyaan

**Route:** `/questions`  
**Files:** `src/app/(main)/questions/page.tsx` → `QuestionsLogic.tsx` → `QuestionsView.tsx`

### Fitur
- List post dengan sort: Terbaru, Terlama, Paling Banyak Vote, Paling Banyak Komentar
- Filter aktif dari URL query (`?category_id=`, `?tag=`)
- Tampil total jumlah pertanyaan
- Paginasi

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts?page={n}` | List semua post |
| `GET` | `/posts/search?category_id=&tag=&sort=&page=` | Filter & sort post |

---

## 3. Detail Pertanyaan

**Route:** `/questions/[id]`  
**Files:** `src/app/(main)/questions/[id]/page.tsx` → `QuestionDetailLogic.tsx` → `QuestionDetailView.tsx` + `CommentSection.tsx`

### Fitur
- Detail post lengkap (judul, isi, tag, author)
- Vote post (upvote/downvote) — tidak bisa vote milik sendiri
- Like/unlike post
- Toggle bookmark
- Edit post → `/questions/[id]/edit` (pemilik/mod/admin)
- Hapus post dengan konfirmasi (pemilik/mod/admin)
- Laporkan post
- Daftar jawaban/komentar beserta replies nested
- Vote komentar
- Like komentar
- Balas komentar (toggle reply form)
- Terima jawaban → tandai `is_accepted` + `is_solved` (pemilik post)
- Form tulis jawaban baru (user login)
- Form reply komentar (user login)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/{id}` | Detail post (views_count +1) |
| `DELETE` | `/posts/{id}` | Hapus post (soft delete) |
| `GET` | `/posts/{postId}/comments` | List komentar + replies |
| `POST` | `/posts/{postId}/vote` | Vote post `{vote: 1\|-1}` |
| `GET` | `/posts/{postId}/user-vote` | Status vote user pada post |
| `POST` | `/posts/{postId}/like` | Toggle like post |
| `GET` | `/posts/{postId}/user-like` | Status like user pada post |
| `POST` | `/posts/{postId}/bookmark` | Toggle bookmark |
| `POST` | `/comments` | Buat komentar/reply |
| `POST` | `/comments/{commentId}/vote` | Vote komentar |
| `POST` | `/comments/{commentId}/like` | Toggle like komentar |
| `POST` | `/comments/{id}/accept` | Terima jawaban (toggle) |
| `POST` | `/reports` | Laporkan post |

---

## 4. Ajukan Pertanyaan

**Route:** `/questions/ask`  
**Files:** `src/app/(main)/questions/ask/page.tsx` → `AskLogic.tsx` → `AskView.tsx`  
**Form:** `useAskForm.ts` + `createPostSchema`

### Fitur
- Form judul (min 15 karakter)
- Form isi pertanyaan (min 30 karakter)
- Pilih kategori dari dropdown
- Tag input: tambah hingga 5 tag (Enter/koma), hapus tag
- Validasi client-side via Zod
- Map error validasi Laravel ke field
- Submit → redirect ke detail post

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/categories?flat=1` | List kategori untuk dropdown |
| `POST` | `/posts` | Buat post baru |

---

## 5. Edit Pertanyaan

**Route:** `/questions/[id]/edit`  
**Files:** `src/app/(main)/questions/[id]/edit/page.tsx` → `EditLogic.tsx` → `EditView.tsx`  
**Form:** `useEditForm.ts` + `updatePostSchema`

### Fitur
- Form pre-filled dari data post (`reset()` saat data load)
- Edit judul, isi, kategori, tag
- Ringkasan edit (opsional)
- Warning sisa quota edit (maks 3x)
- Submit → redirect ke detail post

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/{id}` | Data post untuk pre-fill |
| `GET` | `/categories?flat=1` | List kategori |
| `PATCH` | `/posts/{id}` | Update post |

---

## 6. Pencarian

**Route:** `/search?q=...`  
**Files:** `src/app/(main)/search/page.tsx` → `SearchLogic.tsx` → `SearchView.tsx`

### Fitur
- Search bar — submit baru update URL
- Filter aktif: tag, kategori
- Sort: Terbaru, Terlama, Paling Banyak Vote, Paling Banyak Komentar
- Paginasi hasil pencarian

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/search?q=&category_id=&tag=&sort=&page=` | Search & filter post |

---

## 7. Profil User (Publik)

**Route:** `/users/[id]`  
**Files:** `src/app/(main)/users/[id]/page.tsx` → `UserProfileLogic.tsx` → `UserProfileView.tsx`

### Fitur
- Info profil: nama, bio, lokasi, website, tanggal bergabung
- Badge reputasi + level (Newbie/Regular/Pro/Expert)
- Statistik: reputasi, jumlah post, pengikut, mengikuti
- Daftar badge yang dimiliki
- Tombol Follow/Unfollow (bukan diri sendiri & sudah login)
- Tombol "Edit Profil" (jika profil sendiri)
- Daftar post milik user dengan paginasi

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/users/{id}` | Data profil publik user |
| `GET` | `/users/{userId}/posts?page={n}` | Post milik user |
| `POST` | `/users/{userId}/follow` | Follow user |
| `DELETE` | `/users/{userId}/unfollow` | Unfollow user |
| `GET` | `/users/{userId}/is-following` | Cek status following |

---

## 8. Profil Sendiri / Settings

**Route:** `/profile`  
**Files:** `src/app/(main)/profile/page.tsx` (ssr:false) → `ProfileLogic.tsx` → `ProfileView.tsx`  
**Form:** `useProfileForm.ts` + `updateProfileSchema`

### Fitur
- 4 tab: Informasi, Badge, Mengikuti, Pengikut
- Edit profil: nama, bio, lokasi, website
- Upload foto avatar (klik ikon kamera → file input hidden)
- Ganti password dengan validasi cross-field (Zod `.refine()`)
- Feedback sukses setelah save
- Daftar badge yang dimiliki
- Daftar following & followers

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/profile` | Data profil sendiri |
| `PATCH` | `/profile` | Update profil (JSON atau multipart jika ada avatar) |
| `GET` | `/my-badges` | Badge milik user yang login |
| `GET` | `/users/me/following` | Daftar yang diikuti |
| `GET` | `/users/me/followers` | Daftar pengikut |

---

## 9. Bookmark

**Route:** `/bookmarks`  
**Files:** `src/app/(main)/bookmarks/page.tsx` (ssr:false) → `BookmarksLogic.tsx` → `BookmarksView.tsx`

### Fitur
- List post yang di-bookmark dengan paginasi (15/hal)
- Info: judul, kategori, author, tag, waktu disimpan
- Hapus bookmark individual (dengan konfirmasi)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/bookmarks?page={n}` | List semua bookmark |
| `DELETE` | `/bookmarks/{id}` | Hapus bookmark |
| `POST` | `/posts/{postId}/bookmark` | Toggle bookmark (dari halaman lain) |

---

## 10. Notifikasi

**Route:** `/notifications`  
**Files:** `src/app/(main)/notifications/page.tsx` (ssr:false) → `NotificationsLogic.tsx` → `NotificationsView.tsx`

### Fitur
- List notifikasi paginasi (20/hal)
- Icon per tipe: comment, reply, vote, like, follow, accepted_answer, badge, warning, ban, unban
- Notifikasi belum dibaca: highlight biru, klik untuk tandai dibaca
- Tombol "Tandai semua dibaca"
- Badge unread count di Navbar (polling 30 detik)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/notifications?page={n}` | List notifikasi |
| `PUT` | `/notifications/{id}/read` | Tandai satu dibaca |
| `PUT` | `/notifications/read-all` | Tandai semua dibaca |

---

## 11. Leaderboard

**Route:** `/leaderboard`  
**Files:** `src/app/(main)/leaderboard/page.tsx` → `LeaderboardLogic.tsx` → `LeaderboardView.tsx`

### Fitur
- Ranking user: sort reputasi desc, secondary sort accepted answers
- Badge rank 1/2/3 dengan icon medali
- Tampil: rank, avatar, nama, level, reputasi, jumlah post, jumlah accepted
- Paginasi (15/hal)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/leaderboard?page={n}` | Ranking user |

---

## 12. Login

**Route:** `/login`  
**Files:** `src/app/(auth)/login/page.tsx` → `LoginLogic.tsx` → `LoginView.tsx`  
**Form:** `useLoginForm.ts` + `loginSchema`

### Fitur
- Form email + password
- Validasi Zod client-side
- Error per field dari API (Laravel validation)
- Error umum ke `errors.root` (email salah, banned, dll)
- Redirect ke `?redirect=` URL setelah login berhasil

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/auth/login` | Login, dapat token Sanctum |

---

## 13. Register

**Route:** `/register`  
**Files:** `src/app/(auth)/register/page.tsx` → `RegisterLogic.tsx` → `RegisterView.tsx`  
**Form:** `useRegisterForm.ts` + `registerSchema`

### Fitur
- Form nama, email, password, konfirmasi password
- Validasi cross-field password match via Zod `.refine()`
- Error per field dari API
- Auto-login setelah register (redirect ke home)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/auth/register` | Daftar, dapat token |

---

## 14. Dashboard Moderasi

**Route:** `/moderation`  
**Files:** `src/app/(main)/moderation/page.tsx` (ssr:false) → `ModerationLogic.tsx` → `ModerationView.tsx`  
**Akses:** Role `admin` atau `moderator` (dijaga `useRoleGuard`)

### 4 Tab

**Tab Laporan**
- List laporan dengan filter status: pending / resolved / rejected / semua
- Expand resolve form inline per laporan
- Pilih action: resolve/reject + tindak lanjut (ignore, warn, delete_content, ban_user)
- Catatan resolusi opsional

**Tab Post Dihapus**
- List post soft-deleted
- Expand riwayat edit per post (judul before/after, editor, waktu, summary)

**Tab Komentar Dihapus**
- List komentar soft-deleted
- Expand riwayat edit per komentar (body before/after)

**Tab Manajemen User**
- Input UUID user → Warn (dengan alasan)
- Input UUID user → Ban (durasi hari + alasan)
- Input UUID user → Unban

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/moderation/reports?status=&page=` | List laporan |
| `PUT` | `/moderation/reports/{id}/resolve` | Resolve/reject laporan |
| `GET` | `/moderation/posts/trashed?page=` | List post terhapus |
| `GET` | `/moderation/posts/{id}/history` | Riwayat edit post |
| `GET` | `/moderation/comments/trashed?page=` | List komentar terhapus |
| `GET` | `/moderation/comments/{id}/history` | Riwayat edit komentar |
| `POST` | `/moderation/users/{userId}/warn` | Beri peringatan |
| `POST` | `/moderation/users/{userId}/ban` | Ban user |
| `POST` | `/moderation/users/{userId}/unban` | Unban user |

---

## 15. Dashboard Admin

**Route:** `/admin`  
**Files:** `src/app/(main)/admin/page.tsx` (ssr:false) → `AdminLogic.tsx` → `AdminView.tsx`  
**Akses:** Role `admin` saja (dijaga `useRoleGuard`)

### 4 Tab

**Tab Statistik**
- 8 stat cards: total user, post, komentar, laporan pending, vote, like, kategori, banned user
- Engagement metrics: total interaksi, avg komentar/post, avg vote/post
- Tabel trend aktivitas 7 hari (post, komentar, user baru, vote, like)

**Tab Pengguna & Role**
- Form assign role: UUID user + pilih role → Assign
- Form remove role: UUID user + pilih role → Remove
- Tabel semua user: nama, email, role badge, reputasi

**Tab Laporan**
- Sama dengan tab laporan moderasi (endpoint `/admin/reports`)

**Tab Kategori**
- Tombol "Tambah Kategori" → create form slide down
- List semua kategori dengan inline edit dan hapus

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/admin/statistics` | Statistik platform |
| `GET` | `/admin/statistics/trend` | Trend 7 hari |
| `GET` | `/admin/users` | List semua user + roles |
| `POST` | `/admin/users/{userId}/assign-role` | Assign role |
| `POST` | `/admin/users/{userId}/remove-role` | Remove role |
| `GET` | `/admin/reports?status=&page=` | List laporan |
| `PUT` | `/admin/reports/{id}/resolve` | Resolve laporan |
| `POST` | `/categories` | Buat kategori |
| `PATCH` | `/categories/{id}` | Edit kategori |
| `DELETE` | `/categories/{id}` | Hapus kategori |

---

## Pola Arsitektur

```
src/app/[route]/page.tsx          → Server component, import Logic
src/features/[feature]/
  XxxLogic.tsx   ("use client")   → useState, hooks, API calls, handlers
  XxxView.tsx                     → Pure UI, terima semua via props
  useXxxForm.ts                   → RHF + Zod form config (jika ada form)
src/hooks/                        → React Query hooks per domain
src/lib/schemas.ts                → Semua Zod schemas
src/middleware.ts                 → Route protection (token check)
src/hooks/useRoleGuard.ts         → Role check + redirect
```

## Proteksi Akses

| Layer | Mekanisme | Cek |
|-------|-----------|-----|
| Middleware (`src/middleware.ts`) | Cek cookie `auth_token` | Ada token? |
| `useRoleGuard` hook | Cek `user.roles` via `/auth/me` | Punya role? |
| Laravel BE | Middleware `auth:sanctum` + `role:admin,moderator` | Double check di server |

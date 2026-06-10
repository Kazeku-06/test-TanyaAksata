# TanyaAksata — Halaman, Fitur & Endpoint

> Base URL API: `http://localhost:8000/api/v1`
> Auth: `Authorization: Bearer {token}` (Laravel Sanctum)
> Form Validation: **React Hook Form** + **Zod** (`src/lib/schemas.ts`)

---

## 1. Home / Feed

**Route:** `/`
**File:** `src/app/page.tsx`
**Komponen:** `PostList`, `RightSidebar`

### Fitur
- Daftar post terbaru (paginasi 10/halaman)
- Tab switch: Terbaru / Trending
- Sidebar kanan: widget "Ajukan Pertanyaan" + tag populer
- Tombol "Ajukan Pertanyaan" → ke `/questions/ask`

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts?page={n}` | Daftar post terbaru |
| `GET` | `/posts/trending?limit={n}` | Post trending 7 hari terakhir |
| `GET` | `/categories` | List kategori untuk sidebar/filter |

---

## 2. Semua Pertanyaan

**Route:** `/questions`
**File:** `src/app/(main)/questions/page.tsx`
**Komponen:** `PostList`, `RightSidebar`

### Fitur
- List post + tab Terbaru/Trending
- Filter: Terbaru, Paling Banyak Vote, Paling Banyak Komentar
- Tombol "Ajukan Pertanyaan"

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts?page={n}` | Daftar semua post |
| `GET` | `/posts/trending?limit={n}` | Post trending |

---

## 3. Detail Pertanyaan

**Route:** `/questions/[id]`
**File:** `src/app/(main)/questions/[id]/page.tsx`
**Komponen:** `PostDetailClient`, `CommentList`, `CommentItem`, `CommentForm`, `VoteButton`, `ReportButton`

### Fitur
- Detail isi pertanyaan lengkap
- Vote post (upvote / downvote)
- Like/unlike post
- Toggle bookmark
- Edit post → ke `/questions/[id]/edit` (pemilik/admin/moderator)
- Hapus post (pemilik/admin/moderator)
- Laporkan post
- Daftar jawaban/komentar beserta replies
- Vote komentar
- Like komentar
- Balas komentar (reply)
- Terima jawaban — tandai `is_accepted` (pemilik post)
- Tulis jawaban baru (user login)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/{id}` | Detail post (views_count +1) |
| `POST` | `/posts/{postId}/vote` | Vote post `{vote: 1 atau -1}` |
| `GET` | `/posts/{postId}/user-vote` | Cek vote user pada post |
| `POST` | `/posts/{postId}/like` | Toggle like post |
| `GET` | `/posts/{postId}/user-like` | Cek like status post |
| `POST` | `/posts/{postId}/bookmark` | Toggle bookmark post |
| `DELETE` | `/posts/{id}` | Hapus post (soft delete) |
| `GET` | `/posts/{postId}/comments` | List komentar + replies |
| `POST` | `/comments` | Buat komentar / reply |
| `POST` | `/comments/{commentId}/vote` | Vote komentar |
| `GET` | `/comments/{commentId}/user-vote` | Cek vote user pada komentar |
| `POST` | `/comments/{commentId}/like` | Toggle like komentar |
| `GET` | `/comments/{commentId}/user-like` | Cek like komentar |
| `POST` | `/comments/{id}/accept` | Terima jawaban (toggle) |
| `POST` | `/reports` | Laporkan post |

---

## 4. Ajukan Pertanyaan

**Route:** `/questions/ask`
**File:** `src/app/(main)/questions/ask/page.tsx`
**Komponen:** `AskQuestionForm`
**Form:** `useForm` + `zodResolver(createPostSchema)`

### Fitur
- Form judul pertanyaan (min 15 karakter)
- Form isi pertanyaan (min 30 karakter)
- Pilih kategori (dropdown — `Controller`)
- Tambah tag (maks 5, tekan Enter/koma)
- Validasi client-side via Zod sebelum submit
- Map error validasi Laravel ke field via `setError(fieldName)`
- Submit → redirect ke halaman detail post

### Validasi (Zod — `createPostSchema`)
| Field | Rule |
|-------|------|
| `title` | min 15, max 255 karakter |
| `body` | min 30 karakter |
| `category_id` | wajib dipilih |
| `tags` | array string, maks 5 item, tiap tag maks 50 karakter |

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/categories?flat=1` | List kategori untuk dropdown |
| `POST` | `/posts` | Buat post baru |

---

## 5. Edit Pertanyaan

**Route:** `/questions/[id]/edit`
**File:** `src/app/(main)/questions/[id]/edit/page.tsx`
**Komponen:** `EditPostClient`
**Form:** `useForm` + `zodResolver(updatePostSchema)` + `reset()` saat data post load

### Fitur
- Form pre-filled via `reset()` setelah post data fetched
- Edit judul, isi, kategori, tag
- Field opsional "Ringkasan Edit"
- Maksimal 3 kali edit (dibatasi BE)
- Submit → redirect ke detail post

### Validasi (Zod — `updatePostSchema`)
| Field | Rule |
|-------|------|
| `title` | min 15, max 255 (opsional) |
| `body` | min 30 (opsional) |
| `category_id` | wajib jika diisi |
| `edit_summary` | maks 255 karakter |

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/{id}` | Ambil data post untuk pre-fill |
| `GET` | `/categories?flat=1` | List kategori |
| `PATCH` | `/posts/{id}` | Update post |

---

## 6. Pencarian

**Route:** `/search?q=...`
**File:** `src/app/(main)/search/page.tsx`
**Hook:** `useSearchPosts`

### Fitur
- Cari post berdasarkan keyword (title & body)
- Filter: kategori, tag, user, rentang tanggal
- Sorting: Relevansi, Terbaru, Paling Banyak Vote
- Hasil paginasi (15/halaman)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/search?q=&category_id=&tag=&user_id=&username=&created_from=&created_to=&sort=&page=` | Search & filter post |

---

## 7. Profil User (Publik)

**Route:** `/users/[id]`
**File:** `src/app/(main)/users/[id]/page.tsx`
**Komponen:** `UserProfileClient`, `PostCard`, `ReputationBadge`

### Fitur
- Info profil: nama, bio, lokasi, website, tanggal bergabung
- Badge reputasi + level (Newbie/Regular/Pro/Expert)
- Statistik: jumlah post, pengikut, mengikuti
- Daftar badge yang dimiliki
- Tombol Follow/Unfollow (jika bukan diri sendiri & sudah login)
- Daftar post milik user
- Laporkan user

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/users/{id}` | Data profil publik user |
| `GET` | `/users/{userId}/posts?page={n}` | Post milik user |
| `POST` | `/users/{userId}/follow` | Follow user |
| `DELETE` | `/users/{userId}/unfollow` | Unfollow user |
| `GET` | `/users/{userId}/is-following` | Cek status following |
| `POST` | `/reports` | Laporkan user |

---

## 8. Profil Sendiri / Settings

**Route:** `/profile`
**File:** `src/app/(main)/profile/page.tsx`
**Hook:** `useUpdateProfile`, `useMyBadges`, `useMyFollowing`, `useMyFollowers`
**Form:** `useForm` + `zodResolver(updateProfileSchema)`

### Fitur
- Lihat dan edit profil: nama, bio, lokasi, website
- Upload foto avatar (multipart/form-data otomatis jika ada File)
- Ganti password (butuh `current_password`) — validasi cross-field via Zod `.refine()`
- Daftar badge yang dimiliki
- Daftar following & followers

### Validasi (Zod — `updateProfileSchema`)
| Field | Rule |
|-------|------|
| `name` | maks 255 karakter |
| `bio` | maks 1000 karakter |
| `location` | maks 255 karakter |
| `website` | URL valid atau string kosong |
| `current_password` | wajib jika `new_password` diisi (`.refine()`) |
| `new_password` | min 6 karakter jika diisi |
| `new_password_confirmation` | harus sama dengan `new_password` (`.refine()`) |

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/profile` | Data profil sendiri |
| `PUT/PATCH` | `/profile` | Update profil (JSON atau multipart jika ada avatar) |
| `GET` | `/my-badges` | Badge milik user yang login |
| `GET` | `/users/me/following` | Daftar yang diikuti |
| `GET` | `/users/me/followers` | Daftar pengikut |

---

## 9. Daftar Pengguna

**Route:** `/users`
**File:** `src/app/(main)/users/page.tsx`
**Komponen:** `UserCard`

### Fitur
- Grid daftar semua user
- Info: nama, avatar, reputasi, level

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/leaderboard?page={n}` | Data user (dipakai sebagai daftar user) |

---

## 10. Bookmark

**Route:** `/bookmarks`
**File:** `src/app/(main)/bookmarks/page.tsx`
**Hook:** `useBookmarks`, `useDeleteBookmark`

### Fitur
- Daftar post yang di-bookmark (paginasi 15/halaman)
- Info post: judul, kategori, tag, author
- Hapus bookmark individual
- Toggle bookmark dari halaman lain

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/bookmarks?page={n}` | List semua bookmark user |
| `DELETE` | `/bookmarks/{id}` | Hapus bookmark (by bookmark ID) |
| `POST` | `/posts/{postId}/bookmark` | Toggle bookmark (add/remove) |

---

## 11. Notifikasi

**Route:** `/notifications`
**File:** `src/app/(main)/notifications/page.tsx`
**Hook:** `useNotifications`, `useMarkRead`, `useMarkAllRead`, `useUnreadCount`

### Fitur
- Daftar semua notifikasi (paginasi 20/halaman)
- Tipe: `comment`, `reply`, `vote`, `like`, `follow`, `accepted_answer`, `badge`, `warning`, `ban`, `unban`
- Tandai satu notifikasi sebagai dibaca
- Tandai semua notifikasi sebagai dibaca
- Badge unread count di Navbar (polling setiap 30 detik)

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/notifications?page={n}` | List notifikasi |
| `PUT` | `/notifications/{id}/read` | Tandai satu notifikasi dibaca |
| `PUT` | `/notifications/read-all` | Tandai semua notifikasi dibaca |

---

## 12. Leaderboard

**Route:** `/leaderboard`
**File:** `src/app/(main)/leaderboard/page.tsx`
**Hook:** `useLeaderboard`

### Fitur
- Ranking user berdasarkan reputasi (desc)
- Secondary sort: jawaban diterima (desc)
- Tampil: rank, nama, avatar, reputasi, jumlah post, jumlah accepted answer

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/leaderboard?page={n}` | Data ranking user (paginasi 15/halaman) |

---

## 13. Tag

**Route:** `/tags`
**File:** `src/app/(main)/tags/page.tsx`

### Fitur
- Daftar semua tag
- Klik tag → filter pertanyaan di `/questions?tag={name}`

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/posts/search?tag={name}` | Post berdasarkan tag |

---

## 14. Login

**Route:** `/login`
**File:** `src/app/(auth)/login/page.tsx`
**Hook:** `useLogin`
**Form:** `useForm` + `zodResolver(loginSchema)`

### Fitur
- Form email + password
- Validasi client-side via Zod
- Error dari API di-map ke `errors.root` atau field via `setError()`
- Tampil pesan error: email salah, akun banned, dll
- Link ke halaman register & lupa password

### Validasi (Zod — `loginSchema`)
| Field | Rule |
|-------|------|
| `email` | wajib, format email valid |
| `password` | wajib diisi |

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/auth/login` | Login, terima token Sanctum |

---

## 15. Register

**Route:** `/register`
**File:** `src/app/(auth)/register/page.tsx`
**Hook:** `useRegister`
**Form:** `useForm` + `zodResolver(registerSchema)`

### Fitur
- Form nama, email, password, konfirmasi password
- Validasi cross-field password match via Zod `.refine()`
- Error validasi Laravel di-map ke field via `setError(fieldName)`
- Auto-login setelah register berhasil

### Validasi (Zod — `registerSchema`)
| Field | Rule |
|-------|------|
| `name` | wajib, maks 255 karakter |
| `email` | wajib, format email valid |
| `password` | min 6 karakter |
| `password_confirmation` | harus sama dengan `password` (`.refine()`) |

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/auth/register` | Daftar akun baru, terima token |

---

## 16. Dashboard Moderasi

**Route:** `/moderation`
**File:** `src/app/(main)/moderation/page.tsx`
**Hook:** `useModeration`
**Akses:** Role `admin` atau `moderator`

### Fitur

**Tab Laporan:**
- List laporan dengan filter status: `pending`, `resolved`, `rejected`
- Detail laporan
- Resolve laporan dengan `resolveReportSchema`: action (`resolve`/`reject`) + `action_taken` + catatan

**Tab Post Terhapus:**
- List post yang di-soft delete
- Detail post yang dihapus
- Riwayat edit post

**Tab Komentar Terhapus:**
- List komentar yang di-soft delete
- Riwayat edit komentar

**Tab Manajemen User:**
- Beri peringatan (`warnUserSchema`) — auto-ban jika ≥ 3x
- Ban user (`banUserSchema` — durasi 1–365 hari, default 30)
- Unban user

### Validasi (Zod)
| Schema | Fields |
|--------|--------|
| `warnUserSchema` | `reason` — wajib, maks 255 karakter |
| `banUserSchema` | `days` — integer 1–365, default 30; `reason` — opsional |
| `resolveReportSchema` | `action` — enum; `action_taken` — enum opsional; `resolution_note` — opsional |

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/moderation/dashboard` | Dashboard info |
| `GET` | `/moderation/reports?status={status}&page={n}` | List laporan |
| `GET` | `/moderation/reports/{id}` | Detail laporan |
| `PUT` | `/moderation/reports/{id}/resolve` | Resolve/reject laporan |
| `GET` | `/moderation/posts/trashed?page={n}` | List post terhapus |
| `GET` | `/moderation/posts/{id}/trashed` | Detail post terhapus |
| `GET` | `/moderation/posts/{id}/history` | Riwayat edit post |
| `GET` | `/moderation/comments/trashed?page={n}` | List komentar terhapus |
| `GET` | `/moderation/comments/{id}/trashed` | Detail komentar terhapus |
| `GET` | `/moderation/comments/{id}/history` | Riwayat edit komentar |
| `POST` | `/moderation/users/{userId}/warn` | Beri peringatan |
| `POST` | `/moderation/users/{userId}/ban` | Ban user |
| `POST` | `/moderation/users/{userId}/unban` | Unban user |

---

## 17. Dashboard Admin

**Route:** `/admin`
**File:** `src/app/(main)/admin/page.tsx`
**Hook:** `useAdmin`
**Akses:** Role `admin` saja

### Fitur

**Tab Statistik:**
- Total user, post, komentar, vote, like, laporan, kategori
- Engagement: total interaksi, rata-rata komentar/post, rata-rata vote/post
- Grafik trend aktivitas 7 hari (post, komentar, user baru, vote, like)

**Tab Pengguna & Role:**
- List semua user beserta role-nya
- Assign role ke user (`user`, `moderator`, `admin`)
- Remove role dari user

**Tab Laporan:**
- Sama dengan laporan moderasi (endpoint `/admin/reports`)

**Tab Kategori:**
- Buat kategori baru
- Edit kategori
- Hapus kategori

### Endpoint
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/admin/users` | List semua user + roles |
| `POST` | `/admin/users/{userId}/assign-role` | Assign role ke user |
| `POST` | `/admin/users/{userId}/remove-role` | Remove role dari user |
| `GET` | `/admin/statistics` | Statistik platform lengkap |
| `GET` | `/admin/statistics/trend` | Trend aktivitas 7 hari terakhir |
| `GET` | `/admin/reports?status={status}&page={n}` | List laporan |
| `GET` | `/admin/reports/{id}` | Detail laporan |
| `PUT` | `/admin/reports/{id}/resolve` | Resolve/reject laporan |
| `POST` | `/categories` | Buat kategori baru |
| `PATCH` | `/categories/{id}` | Edit kategori |
| `DELETE` | `/categories/{id}` | Hapus kategori |

---

## Konvensi Form (React Hook Form + Zod)

Semua form mengikuti pola ini:

```tsx
const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

function onSubmit(data: FormData) {
  mutate(data, {
    onError: (err) => {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        // Map Laravel validation errors ke field
        for (const [key, messages] of Object.entries(apiErrors)) {
          setError(key, { message: messages[0] });
        }
      } else {
        // Fallback ke root error
        setError("root", { message: err?.response?.data?.message });
      }
    },
  });
}
```

### Semua Schemas (`src/lib/schemas.ts`)
| Schema | Digunakan di |
|--------|-------------|
| `loginSchema` | `/login` |
| `registerSchema` | `/register` |
| `createPostSchema` | `AskQuestionForm` |
| `updatePostSchema` | `EditPostClient` |
| `createCommentSchema` | `CommentForm` |
| `updateCommentSchema` | (edit komentar inline) |
| `updateProfileSchema` | `/profile` |
| `createReportSchema` | `ReportButton` |
| `warnUserSchema` | moderation — warn user |
| `banUserSchema` | moderation — ban user |
| `resolveReportSchema` | moderation/admin — resolve report |

---

## Ringkasan Cepat

| # | Route | Halaman | Auth | Form |
|---|-------|---------|------|------|
| 1 | `/` | Home / Feed | Public | — |
| 2 | `/questions` | Semua Pertanyaan | Public | — |
| 3 | `/questions/[id]` | Detail Pertanyaan | Public (aksi butuh login) | `CommentForm` |
| 4 | `/questions/ask` | Ajukan Pertanyaan | 🔒 Login | `createPostSchema` |
| 5 | `/questions/[id]/edit` | Edit Pertanyaan | 🔒 Pemilik / Mod / Admin | `updatePostSchema` |
| 6 | `/search` | Pencarian | Public | — |
| 7 | `/users/[id]` | Profil User Publik | Public (aksi butuh login) | `ReportButton` |
| 8 | `/profile` | Profil Sendiri | 🔒 Login | `updateProfileSchema` |
| 9 | `/users` | Daftar Pengguna | Public | — |
| 10 | `/bookmarks` | Bookmark Saya | 🔒 Login | — |
| 11 | `/notifications` | Notifikasi | 🔒 Login | — |
| 12 | `/leaderboard` | Leaderboard | Public | — |
| 13 | `/tags` | Tag | Public | — |
| 14 | `/login` | Login | Guest | `loginSchema` |
| 15 | `/register` | Register | Guest | `registerSchema` |
| 16 | `/moderation` | Dashboard Moderasi | 🔒 Moderator / Admin | `warnUserSchema`, `banUserSchema`, `resolveReportSchema` |
| 17 | `/admin` | Dashboard Admin | 🔒 Admin | `resolveReportSchema` |

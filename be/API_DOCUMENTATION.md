# API Documentation

> **Base URL:** `http://your-domain.com/api/v1`
> **Authentication:** Laravel Sanctum — kirim token di header: `Authorization: Bearer {token}`
> **Format Response:** Semua response dalam format JSON

---

## Daftar Isi

1. [Authentication](#1-authentication)
2. [Profile](#2-profile)
3. [Categories](#3-categories)
4. [Posts](#4-posts)
5. [Comments](#5-comments)
6. [Votes](#6-votes)
7. [Likes](#7-likes)
8. [Bookmarks](#8-bookmarks)
9. [Follows](#9-follows)
10. [Notifications](#10-notifications)
11. [Reports](#11-reports)
12. [Leaderboard](#12-leaderboard)
13. [Moderation (Admin & Moderator)](#13-moderation-admin--moderator)
14. [Admin](#14-admin)
15. [Sistem Reputasi](#15-sistem-reputasi)
16. [Middleware & Role](#16-middleware--role)

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": {}
}
```

### Paginated Data
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [],
    "per_page": 15,
    "total": 100,
    "last_page": 7,
    "next_page_url": "...",
    "prev_page_url": null
  }
}
```

---

## 1. Authentication

### Register
**`POST /api/v1/auth/register`** — Public

Mendaftarkan user baru. Secara otomatis memberikan role `user` dan mengembalikan token Sanctum.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `name` | string | ✅ | Nama lengkap, max 255 karakter |
| `email` | string | ✅ | Email unik, format valid |
| `password` | string | ✅ | Minimal 6 karakter |
| `password_confirmation` | string | ✅ | Harus sama dengan `password` |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "reputation": 0,
      "created_at": "2026-06-08T00:00:00Z"
    },
    "token": "1|abcdefghijklmnop",
    "token_type": "Bearer"
  }
}
```

**Response `422 Unprocessable Entity`:**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

---

### Login
**`POST /api/v1/auth/login`** — Public

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `email` | string | ✅ | Email terdaftar |
| `password` | string | ✅ | Password akun |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "reputation": 150,
      "is_banned": false
    },
    "token": "2|xyz123abc456",
    "token_type": "Bearer"
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

**Response `403 Forbidden`:**
```json
{
  "success": false,
  "message": "Akun Anda sedang dibanned"
}
```

---

### Logout
**`POST /api/v1/auth/logout`** — 🔒 Auth Required

Menghapus token yang sedang aktif.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### Get Current User
**`GET /api/v1/auth/me`** — 🔒 Auth Required

Mengembalikan data user yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatars/filename.jpg",
    "bio": "Bio singkat",
    "location": "Jakarta",
    "website": "https://johndoe.com",
    "reputation": 250,
    "is_banned": false,
    "banned_until": null,
    "created_at": "2026-06-08T00:00:00Z"
  }
}
```

---

## 2. Profile

### Get Profile
**`GET /api/v1/profile`** — 🔒 Auth Required

Mengembalikan profil lengkap user yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatars/photo.jpg",
    "bio": "Saya seorang developer",
    "location": "Jakarta",
    "website": "https://example.com",
    "reputation": 250,
    "is_banned": false
  }
}
```

---

### Update Profile
**`PUT /api/v1/profile`** atau **`PATCH /api/v1/profile`** — 🔒 Auth Required

Mengupdate profil user. Semua field opsional. Gunakan `multipart/form-data` jika upload avatar, atau `application/json` tanpa avatar.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `name` | string | ❌ | Nama lengkap, max 255 |
| `bio` | string | ❌ | Biografi, max 1000 karakter |
| `location` | string | ❌ | Lokasi, max 255 |
| `website` | string (URL) | ❌ | URL website valid |
| `avatar` | file (image) | ❌ | jpeg/png/jpg/gif, max 2MB |
| `current_password` | string | ✅ (jika ganti password) | Password saat ini |
| `new_password` | string | ❌ | Password baru, min 6 karakter |
| `new_password_confirmation` | string | ✅ (jika `new_password` diisi) | Konfirmasi password baru |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Profil berhasil diupdate",
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "bio": "Bio baru saya"
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "success": false,
  "message": "Current password salah"
}
```

---

### Get My Badges
**`GET /api/v1/my-badges`** — 🔒 Auth Required

Mengembalikan semua badge yang dimiliki user yang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "First Post",
      "slug": "first-post",
      "description": "Membuat postingan pertama",
      "icon": "🏆",
      "achievement_type": "post_count",
      "threshold": 1
    }
  ]
}
```

---

## 3. Categories

### List Categories
**`GET /api/v1/categories`** — Public

Mengembalikan daftar kategori. Default: struktur tree (kategori root dengan anak-anaknya).

**Query Parameters:**
| Param | Keterangan |
|---|---|
| `flat` | Jika ada (nilai apapun), kembalikan list datar |

**Response `200 OK` (Tree mode):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology",
      "description": "Topik teknologi",
      "parent_id": null,
      "sort_order": 1,
      "children": [
        {
          "id": "uuid",
          "name": "Web Dev",
          "slug": "web-dev",
          "parent_id": "parent-uuid"
        }
      ]
    }
  ]
}
```

---

### Get Category Detail
**`GET /api/v1/categories/{id}`** — Public

**Path Parameter:** `id` (UUID kategori)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology",
    "parent_id": null,
    "parent": null,
    "children": []
  }
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### Create Category
**`POST /api/v1/categories`** — 🔒 Auth + Role: `admin` atau `moderator`

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `name` | string | ✅ | Unik, max 100 karakter |
| `description` | string | ❌ | Deskripsi, max 255 |
| `parent_id` | UUID | ❌ | ID kategori induk |
| `sort_order` | integer | ❌ | Urutan tampil |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "id": "uuid",
    "name": "New Category",
    "slug": "new-category",
    "sort_order": 0
  }
}
```

---

### Update Category
**`PUT /api/v1/categories/{id}`** atau **`PATCH /api/v1/categories/{id}`** — 🔒 Auth + Role: `admin` atau `moderator`

**Request Body:** Sama seperti create, semua opsional. Gunakan `Content-Type: application/json`.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

---

### Delete Category
**`DELETE /api/v1/categories/{id}`** — 🔒 Auth + Role: `admin` atau `moderator`

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category deleted"
}
```

---

## 4. Posts

### List Posts
**`GET /api/v1/posts`** — Public

Daftar post terbaru. Include: user, category, tags. Paginasi 10/halaman.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "uuid",
        "title": "Judul Post",
        "body": "Isi post...",
        "user_id": "uuid",
        "category_id": "uuid",
        "votes_count": 5,
        "likes_count": 10,
        "comments_count": 3,
        "views_count": 150,
        "is_solved": false,
        "is_edited": false,
        "created_at": "2026-06-08T00:00:00Z",
        "user": { "id": "uuid", "name": "John Doe" },
        "category": { "id": "uuid", "name": "Technology" },
        "tags": [{ "id": "uuid", "name": "laravel" }]
      }
    ],
    "per_page": 10,
    "total": 50
  }
}
```

---

### Trending Posts
**`GET /api/v1/posts/trending`** — Public

Post trending 7 hari terakhir berdasarkan skor: `votes×2 + comments×1.5 + likes×1 + views×0.5`.

**Query Parameters:**
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `limit` | integer | 10 | Jumlah post yang dikembalikan |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [ ...list of posts... ]
}
```

---

### Search Posts
**`GET /api/v1/posts/search`** — Public

Pencarian post dengan berbagai filter.

**Query Parameters:**
| Param | Type | Keterangan |
|---|---|---|
| `q` | string | Keyword (cari di title & body) |
| `category_id` | UUID | Filter berdasarkan kategori |
| `tag` | string | Filter berdasarkan nama tag (partial match) |
| `user_id` | UUID | Filter berdasarkan user |
| `username` | string | Filter berdasarkan nama user (partial match) |
| `created_from` | date (Y-m-d) | Filter dari tanggal |
| `created_to` | date (Y-m-d) | Filter sampai tanggal |
| `sort` | string | `latest` (default), `oldest`, `most_voted`, `most_commented` |

**Response `200 OK`:** Paginated posts (15/halaman), format sama seperti list posts.

---

### Get Post Detail
**`GET /api/v1/posts/{id}`** — Public (Token opsional)

Mendapatkan detail post. Menambah `views_count` setiap kali diakses.

> Jika token dikirim, field `is_bookmarked` akan mencerminkan status bookmark user yang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Judul Post",
    "body": "Isi post...",
    "votes_count": 5,
    "likes_count": 10,
    "comments_count": 3,
    "views_count": 151,
    "is_solved": false,
    "is_edited": true,
    "is_bookmarked": false,
    "accepted_answer_id": null,
    "user": { ... },
    "category": { ... },
    "tags": [ ... ],
    "comments": [ ... ]
  }
}
```

---

### Get Posts by User
**`GET /api/v1/users/{userId}/posts`** — Public

Semua post milik user tertentu. Paginasi 10/halaman.

**Response `200 OK`:** Paginated posts.

---

### Create Post
**`POST /api/v1/posts`** — 🔒 Auth Required

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `title` | string | ✅ | Judul, max 255 karakter |
| `body` | string | ✅ | Isi post |
| `category_id` | UUID | ✅ | Harus ada di tabel categories |
| `tags` | array of string | ❌ | Maks 50 karakter per tag |

**Request Body Example:**
```json
{
  "title": "Cara menggunakan Laravel Sanctum",
  "body": "Laravel Sanctum adalah...",
  "category_id": "uuid-kategori",
  "tags": ["laravel", "api", "sanctum"]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "id": "uuid",
    "title": "Cara menggunakan Laravel Sanctum",
    ...
  }
}
```

> **Side effect:** Penulis mendapat +10 reputasi. Badge dicek otomatis.

---

### Update Post
**`PUT /api/v1/posts/{id}`** atau **`PATCH /api/v1/posts/{id}`** — 🔒 Auth (Pemilik saja)

Maksimal **3 kali edit**. History edit disimpan otomatis.

**Request Body (semua opsional):**
| Field | Type | Keterangan |
|---|---|---|
| `title` | string | Judul baru |
| `body` | string | Isi baru |
| `category_id` | UUID | Kategori baru |
| `tags` | array of string | Tag baru (replace semua) |
| `edit_summary` | string | Ringkasan perubahan, max 255 |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Post updated",
  "data": { ...post... }
}
```

**Response `403 Forbidden`:**
```json
{
  "success": false,
  "message": "Batas maksimal edit (3 kali) sudah tercapai"
}
```

---

### Delete Post
**`DELETE /api/v1/posts/{id}`** — 🔒 Auth (Pemilik / Admin / Moderator)

Soft delete — post tidak hilang dari database.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Post deleted"
}
```

---

## 5. Comments

### List Comments
**`GET /api/v1/posts/{postId}/comments`** — Public

Komentar top-level dari sebuah post, termasuk nested replies. Diurutkan dari yang terlama.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "parent_id": null,
      "body": "Komentar ini sangat membantu!",
      "votes_count": 3,
      "likes_count": 5,
      "is_accepted": true,
      "is_edited": false,
      "user": { "id": "uuid", "name": "Jane" },
      "replies": [
        {
          "id": "uuid",
          "parent_id": "uuid-parent",
          "body": "Setuju!",
          "user": { ... }
        }
      ]
    }
  ]
}
```

---

### Create Comment / Reply
**`POST /api/v1/comments`** — 🔒 Auth Required

Jika `parent_id` disertakan, komentar ini menjadi reply dari komentar lain.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `post_id` | UUID | ✅ | ID post yang dikomentari |
| `body` | string | ✅ | Isi komentar |
| `parent_id` | UUID | ❌ | ID komentar induk (untuk reply) |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Komentar ditambahkan",
  "data": {
    "id": "uuid",
    "body": "Komentar baru",
    "user": { ... }
  }
}
```

**Response `403 Forbidden`:**
```json
{
  "success": false,
  "message": "Anda sebagai pemilik postingan hanya bisa memberikan maksimal 4 komentar pada postingan Anda sendiri."
}
```

> **Side effect:** `comments_count` post bertambah. Penulis +2 reputasi. Notifikasi dikirim ke pemilik post dan pemilik komentar induk (jika reply).

---

### Update Comment
**`PUT /api/v1/comments/{id}`** atau **`PATCH /api/v1/comments/{id}`** — 🔒 Auth (Pemilik saja)

Maksimal **1 kali edit**.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `body` | string | ✅ | Isi komentar baru |
| `edit_summary` | string | ❌ | Ringkasan perubahan |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Komentar diperbarui",
  "data": { ...comment... }
}
```

---

### Delete Comment
**`DELETE /api/v1/comments/{id}`** — 🔒 Auth (Pemilik / Admin / Moderator)

Soft delete. `comments_count` pada post dikurangi.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Komentar dihapus"
}
```

---

### Accept Answer
**`POST /api/v1/comments/{id}/accept`** — 🔒 Auth (Pemilik Post saja)

Menandai komentar sebagai jawaban yang diterima (toggle). Menandai post sebagai `is_solved`.

- Jika komentar sudah diterima → batalkan (is_solved kembali false)
- Jika ada jawaban lain yang diterima → jawaban lama dibatalkan otomatis

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Answer accepted.",
  "data": {
    "post_id": "uuid",
    "accepted_comment_id": "uuid",
    "is_solved": true
  }
}
```

> **Side effect:** Penulis komentar +15 reputasi. Notifikasi dikirim ke penulis komentar.

---

## 6. Votes

> Tidak bisa vote konten milik sendiri. Voting ulang dengan nilai sama akan menghapus vote (toggle).

### Vote Post
**`POST /api/v1/posts/{postId}/vote`** — 🔒 Auth Required

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `vote` | integer | ✅ | `1` (upvote) atau `-1` (downvote) |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Vote added",
  "data": {
    "votes_count": 6,
    "user_vote": 1
  }
}
```

> **Efek reputasi pada penulis post:** Upvote +5, Downvote -2. Voter kehilangan -1 reputasi jika downvote.

---

### Vote Comment
**`POST /api/v1/comments/{commentId}/vote`** — 🔒 Auth Required

**Request Body:** Sama seperti vote post.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Vote added",
  "data": {
    "votes_count": 2,
    "user_vote": 1
  }
}
```

> **Efek reputasi pada penulis komentar:** Upvote +3, Downvote -1.

---

### Get User's Vote on Post
**`GET /api/v1/posts/{postId}/user-vote`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user_vote": 1
  }
}
```
> `user_vote` bisa `1`, `-1`, atau `null` (belum vote).

---

### Get User's Vote on Comment
**`GET /api/v1/comments/{commentId}/user-vote`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user_vote": -1
  }
}
```

---

## 7. Likes

> Tidak bisa like konten milik sendiri. Toggle (like → unlike → like).

### Toggle Like Post
**`POST /api/v1/posts/{postId}/like`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Post liked",
  "data": {
    "likes_count": 11,
    "is_liked": true
  }
}
```
> Notifikasi dikirim ke pemilik post saat di-like.

---

### Check User Like on Post
**`GET /api/v1/posts/{postId}/user-like`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "is_liked": true
  }
}
```

---

### Toggle Like Comment
**`POST /api/v1/comments/{commentId}/like`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Comment liked",
  "data": {
    "likes_count": 4,
    "is_liked": true
  }
}
```

---

### Check User Like on Comment
**`GET /api/v1/comments/{commentId}/user-like`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "is_liked": false
  }
}
```

---

## 8. Bookmarks

### Toggle Bookmark
**`POST /api/v1/posts/{postId}/bookmark`** — 🔒 Auth Required

Tambah atau hapus bookmark secara otomatis (toggle).

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Bookmark added",
  "data": {
    "is_bookmarked": true
  }
}
```

---

### List My Bookmarks
**`GET /api/v1/bookmarks`** — 🔒 Auth Required

Semua bookmark user yang login. Paginasi 15/halaman. Include post dengan user, category, tags.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "post_id": "uuid",
        "created_at": "2026-06-08T00:00:00Z",
        "post": {
          "id": "uuid",
          "title": "Judul Post",
          "user": { ... },
          "category": { ... },
          "tags": [ ... ]
        }
      }
    ]
  }
}
```

---

### Delete Bookmark
**`DELETE /api/v1/bookmarks/{id}`** — 🔒 Auth Required

Hapus bookmark berdasarkan ID bookmark (bukan ID post).

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Bookmark deleted"
}
```

---

## 9. Follows

### Follow User
**`POST /api/v1/users/{userId}/follow`** — 🔒 Auth Required

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Berhasil mengikuti Jane Doe"
}
```

**Error Responses:**
- `400` — Tidak bisa follow diri sendiri
- `404` — User tidak ditemukan
- `409` — Sudah mengikuti user ini

---

### Unfollow User
**`DELETE /api/v1/users/{userId}/unfollow`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Berhasil berhenti mengikuti Jane Doe"
}
```

---

### Check Is Following
**`GET /api/v1/users/{userId}/is-following`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "is_following": true
  }
}
```

---

### My Following List
**`GET /api/v1/users/me/following`** — 🔒 Auth Required

Daftar user yang diikuti oleh user yang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "avatars/jane.jpg"
    }
  ]
}
```

---

### My Followers List
**`GET /api/v1/users/me/followers`** — 🔒 Auth Required

Daftar user yang mengikuti user yang login.

**Response `200 OK`:** Format sama seperti following list.

---

## 10. Notifications

### List Notifications
**`GET /api/v1/notifications`** — 🔒 Auth Required

Semua notifikasi user yang login, diurutkan terbaru. Paginasi 20/halaman.

**Tipe notifikasi:** `comment`, `reply`, `vote`, `like`, `follow`, `accepted_answer`, `badge`, `warning`, `ban`, `unban`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "actor_id": "uuid",
        "type": "comment",
        "target_type": "App\\Models\\Post",
        "target_id": "uuid",
        "message": "User John berkomentar pada postingan Anda 'Judul Post'",
        "is_read": false,
        "created_at": "2026-06-08T00:00:00Z"
      }
    ]
  }
}
```

---

### Mark Notification as Read
**`PUT /api/v1/notifications/{id}/read`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Notifikasi ditandai dibaca"
}
```

---

### Mark All Notifications as Read
**`PUT /api/v1/notifications/read-all`** — 🔒 Auth Required

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Semua notifikasi ditandai dibaca"
}
```

---

## 11. Reports

### Submit Report
**`POST /api/v1/reports`** — 🔒 Auth Required

Melaporkan post, komentar, atau user.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `target_type` | string | ✅ | `post`, `comment`, atau `user` |
| `target_id` | UUID | ✅ | ID konten yang dilaporkan |
| `reason` | string | ✅ | Alasan laporan, max 100 karakter |
| `description` | string | ❌ | Detail tambahan, max 500 karakter |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Laporan berhasil dikirim, akan ditinjau oleh moderator.",
  "data": {
    "id": "uuid",
    "reporter_id": "uuid",
    "target_type": "App\\Models\\Post",
    "target_id": "uuid",
    "reason": "Konten tidak pantas",
    "status": "pending",
    "reporter": { ... }
  }
}
```

**Response `409 Conflict`:**
```json
{
  "success": false,
  "message": "Anda sudah melaporkan konten ini sebelumnya"
}
```

---

## 12. Leaderboard

### Get Leaderboard
**`GET /api/v1/leaderboard`** — Public

Ranking user berdasarkan reputasi (desc), kemudian jawaban yang diterima (desc). Paginasi 15/halaman.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Top User",
        "reputation": 2500,
        "posts_count": 45,
        "accepted_count": 20,
        "rank": 1
      }
    ]
  }
}
```

---

## 13. Moderation (Admin & Moderator)

> **Middleware:** `auth:sanctum` + `role:admin,moderator`
> **Prefix:** `/api/v1/moderation`

### Dashboard
**`GET /api/v1/moderation/dashboard`**

**Response `200 OK`:**
```json
{
  "message": "Welcome, moderator or admin!"
}
```

---

### Trashed Posts
**`GET /api/v1/moderation/posts/trashed`**

Daftar post yang sudah di-soft delete. Paginasi 15/halaman.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { ...paginated trashed posts with user & category... }
}
```

---

### Get Trashed Post
**`GET /api/v1/moderation/posts/{id}/trashed`**

Detail satu post yang sudah dihapus.

**Response `200 OK`:** Post dengan user, category, tags.

---

### Post Edit History
**`GET /api/v1/moderation/posts/{id}/history`**

Riwayat edit lengkap sebuah post (termasuk yang sudah dihapus).

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "edited_by": "uuid",
      "title_before": "Judul Lama",
      "title_after": "Judul Baru",
      "body_before": "...",
      "body_after": "...",
      "edit_summary": "Perbaikan typo",
      "created_at": "...",
      "editor": { "id": "uuid", "name": "John" }
    }
  ]
}
```

---

### Trashed Comments
**`GET /api/v1/moderation/comments/trashed`**

Daftar komentar yang dihapus. Paginasi 15/halaman.

---

### Get Trashed Comment
**`GET /api/v1/moderation/comments/{id}/trashed`**

Detail satu komentar yang dihapus.

---

### Comment Edit History
**`GET /api/v1/moderation/comments/{id}/history`**

Riwayat edit sebuah komentar.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "comment_id": "uuid",
      "edited_by": "uuid",
      "body_before": "Isi lama",
      "body_after": "Isi baru",
      "edit_summary": null,
      "created_at": "..."
    }
  ]
}
```

---

### Warn User
**`POST /api/v1/moderation/users/{userId}/warn`**

Memberikan peringatan kepada user. Jika mencapai 3 peringatan, user otomatis dibanned 30 hari.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `reason` | string | ✅ | Alasan peringatan, max 255 |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "User John mendapat peringatan ke-2"
}
```

> **Side effect:** Notifikasi dikirim ke user. Auto-ban jika warning_count ≥ 3.

---

### Ban User
**`POST /api/v1/moderation/users/{userId}/ban`**

**Request Body:**
| Field | Type | Required | Default | Keterangan |
|---|---|---|---|---|
| `days` | integer | ❌ | 30 | Durasi ban (1–365 hari) |
| `reason` | string | ❌ | - | Alasan ban |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "User John berhasil dibanned selama 30 hari"
}
```

**Response `409 Conflict`:** User sudah dibanned.

---

### Unban User
**`POST /api/v1/moderation/users/{userId}/unban`**

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `reason` | string | ❌ | Alasan unban |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "User John berhasil di-unban"
}
```

---

### List Reports (Moderation)
**`GET /api/v1/moderation/reports`**

**Query Parameters:**
| Param | Keterangan |
|---|---|
| `status` | Filter: `pending`, `resolved`, `rejected` |

**Response `200 OK`:** Paginated reports (15/halaman) dengan reporter dan resolver.

---

### Get Report Detail (Moderation)
**`GET /api/v1/moderation/reports/{id}`**

**Response `200 OK`:** Detail report dengan reporter, resolver, dan target.

---

### Resolve Report
**`PUT /api/v1/moderation/reports/{id}/resolve`**

Menyelesaikan atau menolak laporan dengan tindakan tertentu.

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `action` | string | ✅ | `resolve` atau `reject` |
| `action_taken` | string | ✅ (jika `resolve`) | `delete_content`, `ban_user`, `warn`, `ignore` |
| `resolution_note` | string | ❌ | Catatan resolusi |

**Tindakan yang tersedia:**
| `action_taken` | Efek |
|---|---|
| `delete_content` | Soft delete post atau comment yang dilaporkan |
| `ban_user` | Ban user yang dilaporkan selama 30 hari |
| `warn` | Kirim notifikasi peringatan ke pemilik konten |
| `ignore` | Tandai selesai tanpa tindakan |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Laporan diproses dengan tindakan: delete_content",
  "data": { ...report... }
}
```

> Semua tindakan dicatat ke tabel `moderation_logs`.

---

## 14. Admin

> **Middleware:** `auth:sanctum` + `role:admin`
> **Prefix:** `/api/v1/admin`

### List All Users with Roles
**`GET /api/v1/admin/users`**

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": [
        { "id": "uuid", "name": "user" }
      ]
    }
  ]
}
```

---

### Assign Role to User
**`POST /api/v1/admin/users/{userId}/assign-role`**

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `role_name` | string | ✅ | Nama role yang ada di tabel roles |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Role assigned successfully"
}
```

> Idempotent — tidak akan duplikat jika role sudah dimiliki.

---

### Remove Role from User
**`POST /api/v1/admin/users/{userId}/remove-role`**

**Request Body:**
| Field | Type | Required | Keterangan |
|---|---|---|---|
| `role_name` | string | ✅ | Nama role yang ingin dihapus |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Role removed successfully"
}
```

---

### List Reports (Admin)
**`GET /api/v1/admin/reports`**
**`GET /api/v1/admin/reports/{id}`**
**`PUT /api/v1/admin/reports/{id}/resolve`**

Sama persis dengan endpoint moderation reports.

---

### Platform Statistics
**`GET /api/v1/admin/statistics`**

Statistik platform secara keseluruhan.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 500,
      "new_this_week": 25,
      "banned": 3
    },
    "posts": {
      "total": 1200,
      "published_this_week": 80,
      "solved": 450,
      "deleted": 15
    },
    "comments": {
      "total": 4500,
      "this_week": 300,
      "deleted": 50
    },
    "votes": {
      "total": 8000,
      "upvotes": 7200,
      "downvotes": 800
    },
    "likes": {
      "total": 3500,
      "this_week": 200
    },
    "reports": {
      "total": 120,
      "pending": 15,
      "resolved": 90,
      "rejected": 15
    },
    "categories": {
      "total": 20
    },
    "engagement": {
      "total_interactions": 16000,
      "avg_comments_per_post": 3.75,
      "avg_votes_per_post": 6.67
    }
  }
}
```

---

### Activity Trend (7 Days)
**`GET /api/v1/admin/statistics/trend`**

Aktivitas platform per hari dalam 7 hari terakhir.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-06-02",
      "posts": 12,
      "comments": 45,
      "users": 5,
      "votes": 80,
      "likes": 60
    },
    ...
  ]
}
```

---

## 15. Sistem Reputasi

Reputasi dihitung secara otomatis berdasarkan aktivitas:

| Aksi | Poin |
|---|---|
| Membuat post | +10 |
| Membuat komentar | +2 |
| Post mendapat upvote | +5 |
| Post mendapat downvote | -2 |
| Memberi downvote (voter) | -1 |
| Komentar mendapat upvote | +3 |
| Komentar mendapat downvote | -1 |
| Jawaban diterima (accept) | +15 |

**Level Reputasi:**
| Level | Minimal Reputasi |
|---|---|
| Newbie | 0 |
| Regular | 100 |
| Pro | 500 |
| Expert | 2000 |

**Badge** diberikan otomatis berdasarkan pencapaian (`achievement_type`):
- `points` — threshold reputasi
- `post_count` — jumlah post
- `comment_count` — jumlah komentar
- `accepted_count` — jumlah jawaban diterima

---

## 16. Middleware & Role

### Middleware yang Tersedia

| Middleware | Keterangan |
|---|---|
| `auth:sanctum` | Wajib token valid di header `Authorization: Bearer {token}` |
| `role:admin` | Hanya bisa diakses role `admin` |
| `role:admin,moderator` | Bisa diakses role `admin` atau `moderator` |
| `banned` (CheckBanned) | Menolak akses jika `is_banned = true` |

### Default Roles

| Role | Keterangan |
|---|---|
| `user` | Role default semua user baru |
| `moderator` | Akses moderasi konten dan user |
| `admin` | Akses penuh termasuk manajemen role dan statistik |

### Error Codes Umum

| HTTP Status | Keterangan |
|---|---|
| `200` | Sukses |
| `201` | Berhasil dibuat |
| `400` | Request tidak valid (logika bisnis) |
| `401` | Tidak terautentikasi |
| `403` | Tidak diizinkan (role atau banned) |
| `404` | Data tidak ditemukan |
| `409` | Konflik (duplikat data) |
| `422` | Validasi gagal |

---

## Catatan Teknis

- Semua ID menggunakan **UUID** (bukan integer auto-increment)
- Post dan Comment menggunakan **Soft Delete** (`deleted_at`)
- Token autentikasi menggunakan **Laravel Sanctum**
- Upload avatar disimpan di `storage/avatars/`
- Format tanggal menggunakan **ISO 8601** (`Y-m-d H:i:s` / `Y-m-d\TH:i:s\Z`)
- Untuk endpoint `PUT/PATCH`, gunakan `Content-Type: application/json` (bukan `form-data`) kecuali ada upload file

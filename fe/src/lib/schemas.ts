import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama wajib diisi")
      .max(255, "Nama maksimal 255 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter"),
    password_confirmation: z
      .string()
      .min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

// ── Post ─────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z
    .string()
    .min(15, "Judul minimal 15 karakter")
    .max(255, "Judul maksimal 255 karakter"),
  body: z
    .string()
    .min(30, "Isi pertanyaan minimal 30 karakter"),
  category_id: z
    .string()
    .min(1, "Pilih kategori"),
  tags: z
    .array(z.string().max(50, "Tag maksimal 50 karakter"))
    .max(5, "Maksimal 5 tag"),
  tagInput: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(15, "Judul minimal 15 karakter")
    .max(255, "Judul maksimal 255 karakter")
    .optional(),
  body: z
    .string()
    .min(30, "Isi pertanyaan minimal 30 karakter")
    .optional(),
  category_id: z
    .string()
    .min(1, "Pilih kategori")
    .optional(),
  tags: z
    .array(z.string().max(50))
    .max(5, "Maksimal 5 tag")
    .optional(),
  tagInput: z.string().optional(),
  edit_summary: z
    .string()
    .max(255, "Ringkasan edit maksimal 255 karakter")
    .optional(),
});

// ── Comment ──────────────────────────────────────────────────

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(10, "Komentar minimal 10 karakter"),
});

export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(10, "Komentar minimal 10 karakter"),
  edit_summary: z
    .string()
    .max(255)
    .optional(),
});

// ── Profile ──────────────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama wajib diisi")
      .max(255, "Nama maksimal 255 karakter")
      .optional(),
    bio: z
      .string()
      .max(1000, "Bio maksimal 1000 karakter")
      .optional(),
    location: z
      .string()
      .max(255, "Lokasi maksimal 255 karakter")
      .optional(),
    website: z
      .string()
      .url("Format URL tidak valid")
      .max(255)
      .or(z.literal(""))
      .optional(),
    current_password: z.string().optional(),
    new_password: z
      .string()
      .min(6, "Password baru minimal 6 karakter")
      .optional()
      .or(z.literal("")),
    new_password_confirmation: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.new_password && data.new_password.length > 0) {
        return !!data.current_password;
      }
      return true;
    },
    {
      message: "Password lama wajib diisi untuk ganti password",
      path: ["current_password"],
    }
  )
  .refine(
    (data) => {
      if (data.new_password && data.new_password.length > 0) {
        return data.new_password === data.new_password_confirmation;
      }
      return true;
    },
    {
      message: "Konfirmasi password tidak cocok",
      path: ["new_password_confirmation"],
    }
  );

// ── Report ───────────────────────────────────────────────────

export const createReportSchema = z.object({
  reason: z
    .string()
    .min(1, "Alasan wajib diisi")
    .max(100, "Alasan maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
});

// ── Moderation ───────────────────────────────────────────────

export const warnUserSchema = z.object({
  reason: z
    .string()
    .min(1, "Alasan wajib diisi")
    .max(255, "Alasan maksimal 255 karakter"),
});

export const banUserSchema = z.object({
  days: z
    .number()
    .int("Durasi harus bilangan bulat")
    .min(1, "Minimal 1 hari")
    .max(365, "Maksimal 365 hari"),
  reason: z
    .string()
    .max(255)
    .optional(),
});

export const resolveReportSchema = z.object({
  action: z.enum(["resolve", "reject"]),
  action_taken: z.enum(["delete_content", "ban_user", "warn", "ignore"]).optional(),
  resolution_note: z.string().max(500).optional(),
});

// ── Types inferred from schemas ──────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateReportFormData = z.infer<typeof createReportSchema>;
export type WarnUserFormData = z.infer<typeof warnUserSchema>;
export type BanUserFormData = z.infer<typeof banUserSchema>;
export type ResolveReportFormData = z.infer<typeof resolveReportSchema>;

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useAuth";

type RequiredRole = "admin" | "moderator";

/**
 * Hook untuk proteksi halaman berdasarkan role.
 * Redirect ke '/' jika user tidak punya role yang dibutuhkan.
 *
 * Contoh penggunaan:
 *   const { isAllowed, isLoading } = useRoleGuard(["admin"])
 *   const { isAllowed, isLoading } = useRoleGuard(["admin", "moderator"])
 */
export function useRoleGuard(requiredRoles: RequiredRole[]) {
  const router = useRouter();
  const { data: user, isLoading } = useMe();

  const hasRole =
    !!user &&
    user.roles?.some((r) => requiredRoles.includes(r.name as RequiredRole));

  useEffect(() => {
    // Tunggu sampai loading selesai baru cek role
    if (!isLoading && user && !hasRole) {
      router.replace("/");
    }
    // Jika tidak ada user sama sekali (belum login) → middleware sudah handle redirect
  }, [isLoading, user, hasRole, router]);

  return {
    isAllowed: hasRole,
    isLoading,
    user,
  };
}

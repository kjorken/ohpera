import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";

export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  return { isAuthed: !!token, isHydrated };
}

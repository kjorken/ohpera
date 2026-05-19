import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";

export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  return { isAuthed: !!token };
}

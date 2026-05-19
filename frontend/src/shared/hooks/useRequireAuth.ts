import { useAuthStore } from "@/shared/store/auth.store";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useRequireAuth() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  return { isAuthed: !!token };
}

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/shared/store/auth.store";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/dashboard");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || token) return null;

  return <>{children}</>;
}

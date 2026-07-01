import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/query-client";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { useAuthStore } from "@/shared/store/auth.store";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

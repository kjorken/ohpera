import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/query-client";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { useAuthStore } from "@/shared/store/auth.store";
import { useEffect } from "react";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const frauncesFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export default function App({ Component, pageProps }: AppProps) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className={`${bodyFont.variable} ${frauncesFont.variable} font-sans`}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </div>
  );
}

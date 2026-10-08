"use client";

import { Geist } from "next/font/google";
import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/60 bg-white/40 px-6 backdrop-blur-md">
          <Logo />
          <span className="text-lg font-semibold">Promptly</span>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/70 p-8 text-center shadow-lg backdrop-blur">
            <h1 className="text-2xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm leading-relaxed text-foreground/80">
              We couldn&apos;t reach the database. This demo runs on a
              serverless Postgres (Neon) that sleeps when idle and can take a
              few seconds to wake up. Please try again in a moment.
            </p>
            <Button className="rounded-md" onClick={reset}>
              Try again
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}

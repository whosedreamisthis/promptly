import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import ChatsLoader from "@/components/chat/ChatsLoader";
import NavBar from "@/components/layout/NavBar";
import { Toaster } from "@/components/ui/sonner";
import AppShell from "@/components/sidebar/AppShell";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const CLERK_LOCALIZATION = {
  signIn: {
    start: {
      actionLink: "Register",
    },
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Promptly",
  description: "Promptly AI chat",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-dvh overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/register"
          localization={CLERK_LOCALIZATION}
        >
          <Suspense fallback={null}>
            <ChatsLoader>
              <AppShell
                navbar={
                  <Suspense
                    fallback={
                      <div className="h-16 border-b border-white/60 bg-white/40" />
                    }
                  >
                    <NavBar />
                  </Suspense>
                }
              >
                {children}
              </AppShell>
            </ChatsLoader>
          </Suspense>
          <Toaster />
        </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

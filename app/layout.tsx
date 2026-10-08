import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ChatsProvider from "@/components/chat/ChatsProvider";
import NavBar from "@/components/layout/NavBar";
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
    >
      <body className="h-screen overflow-hidden">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/register"
          localization={CLERK_LOCALIZATION}
        >
          <ChatsProvider>
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
          </ChatsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

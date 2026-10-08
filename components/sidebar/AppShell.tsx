"use client";

import { Suspense, useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { USER_MENU_POPOVER_CLASS } from "@/lib/clerk-appearance";
import RoutedSidebar from "@/components/sidebar/RoutedSidebar";

interface AppShellProps {
  navbar: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ navbar, children }: AppShellProps) {
  const [closed, setClosed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpen = () => {
    setClosed(false);
    setMobileOpen(true);
  };

  const handleClose = () => {
    setClosed(true);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-full">
      <Suspense fallback={null}>
        <RoutedSidebar
          closed={closed}
          mobileOpen={mobileOpen}
          onClose={handleClose}
        />
      </Suspense>
      <div className="relative flex min-w-0 flex-1 flex-col">
        {navbar}
        <div
          className={`absolute left-3 top-3.5 z-10 items-center gap-2 ${
            closed ? "flex" : "flex md:hidden"
          }`}
        >
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={handleOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-pastel-lavender focus-visible:outline-2 focus-visible:outline-pastel-mint"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold">Promptly</span>
        </div>
        <Show when="signed-in">
          <div
            className={`absolute bottom-3 left-3 z-10 flex h-9 items-center transition-[opacity,visibility] ease-in-out ${
              closed
                ? "visible opacity-100 delay-[250ms] duration-500"
                : "invisible opacity-0 duration-150 max-md:visible max-md:opacity-100"
            }`}
          >
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: "rounded-md p-1",
                  userButtonPopoverCard: USER_MENU_POPOVER_CLASS,
                },
              }}
            />
          </div>
        </Show>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { USER_MENU_POPOVER_CLASS } from "@/lib/clerk-appearance";
import { Button } from "@/components/ui/button";
import DemoBanner from "@/components/layout/DemoBanner";
import RoutedSidebar from "@/components/sidebar/RoutedSidebar";

interface AppShellProps {
  navbar: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ navbar, children }: AppShellProps) {
  const [closed, setClosed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpen = () => {
    setClosed(false);
    setMobileOpen(true);
  };

  const handleClose = () => {
    setClosed(true);
    setMobileOpen(false);
  };

  // On desktop the sidebar overlays the page, so clicking the page dismisses it.
  const handleMainAreaClick = () => {
    if (!closed && window.matchMedia("(min-width: 768px)").matches) {
      handleClose();
    }
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
      <div
        className="relative flex min-w-0 flex-1 flex-col"
        onClick={handleMainAreaClick}
      >
        <DemoBanner />
        <div className="relative">
          {navbar}
          <div
            className={`absolute left-3 top-3.5 z-10 items-center gap-2 ${
              closed ? "flex" : "flex md:hidden"
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open sidebar"
              onClick={handleOpen}
            >
              <Menu className="size-5" />
            </Button>
            <span className="text-lg font-semibold">Promptly</span>
          </div>
        </div>
        <Show when="signed-in">
          <div
            className={`absolute bottom-4 left-3 z-10 flex h-11.5 items-center transition-[opacity,visibility] ease-in-out ${
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

"use client";

import { X } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  onClose: () => void;
}

export default function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2 px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
        <Logo className="h-7 w-7 shrink-0" />
        <span className="truncate text-lg font-semibold">Promptly</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close sidebar"
        onClick={onClose}
      >
        <X className="size-5" />
      </Button>
    </div>
  );
}

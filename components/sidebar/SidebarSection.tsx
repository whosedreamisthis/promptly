"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  children,
}: SidebarSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="pb-2">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-1 rounded-md px-2 py-2 text-sm text-stone-500 transition-colors hover:bg-[#EFE8F6]"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expanded ? "" : "-rotate-90"
          }`}
        />
      </button>
      {expanded && children}
    </section>
  );
}

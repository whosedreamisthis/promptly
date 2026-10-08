"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  children,
}: SidebarSectionProps) {
  return (
    <Collapsible defaultOpen asChild>
      <section className="pb-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="group h-9 w-full justify-start gap-1 px-2 font-normal text-muted-foreground aria-expanded:bg-transparent aria-expanded:hover:bg-accent"
          >
            {title}
            <ChevronDown className="transition-transform group-data-[state=closed]:-rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </section>
    </Collapsible>
  );
}

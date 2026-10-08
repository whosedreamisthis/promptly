import Link from "next/link";
import { Show } from "@clerk/nextjs";
import DemoButton from "@/components/layout/DemoButton";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  return (
    <>
      <Show when="signed-out">
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-white/60 bg-white/40 px-6 backdrop-blur-md">
          <nav className="flex items-center gap-3">
            <DemoButton
              label="Demo"
              variant="ghost"
              className="h-9 rounded-md px-4 hover:bg-highlight hover:text-highlight-foreground"
            />
            <Button asChild className="h-9 px-4 hover:bg-secondary">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </nav>
        </header>
      </Show>
      <Show when="signed-in">
        <div className="h-14 shrink-0" />
      </Show>
    </>
  );
}

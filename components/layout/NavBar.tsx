import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  return (
    <>
      <Show when="signed-out">
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-white/60 bg-white/40 px-6 backdrop-blur-md">
          <nav className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="h-9 px-4 hover:bg-pastel-peach"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="h-9 px-4 hover:bg-secondary">
              <Link href="/register">Register</Link>
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

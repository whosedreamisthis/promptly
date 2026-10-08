import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const BUTTON_CLASS =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors";

export default function NavBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-black/[.08] px-6 dark:border-white/[.145]">
      <Link href="/" className="text-lg font-semibold">
        Promptly
      </Link>
      <nav className="flex items-center gap-3">
        <Show when="signed-out">
          <Link
            href="/sign-in"
            className={`${BUTTON_CLASS} hover:bg-black/[.04] dark:hover:bg-[#1a1a1a]`}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={`${BUTTON_CLASS} bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]`}
          >
            Register
          </Link>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </nav>
    </header>
  );
}

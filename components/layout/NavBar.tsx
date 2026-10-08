import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const BUTTON_CLASS =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors";

export default function NavBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/60 bg-white/40 px-6 backdrop-blur-md">
      <Link href="/" className="text-lg font-semibold">
        Promptly
      </Link>
      <nav className="flex items-center gap-3">
        <Show when="signed-out">
          <Link
            href="/sign-in"
            className={`${BUTTON_CLASS} hover:bg-pastel-peach`}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={`${BUTTON_CLASS} bg-pastel-mint text-foreground hover:bg-pastel-lavender`}
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

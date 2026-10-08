import Link from "next/link";
import { Show } from "@clerk/nextjs";

const BUTTON_CLASS =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors";

export default function NavBar() {
  return (
    <>
      <Show when="signed-out">
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-white/60 bg-white/40 px-6 backdrop-blur-md">
          <nav className="flex items-center gap-3">
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
          </nav>
        </header>
      </Show>
      <Show when="signed-in">
        <div className="h-14 shrink-0" />
      </Show>
    </>
  );
}

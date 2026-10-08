# Feature History

- **Clerk Authentication:** Installed `@clerk/nextjs` and added `proxy.ts` with Clerk middleware (no protected routes yet). Added Sign in and Register buttons to the nav bar (`components/layout/NavBar.tsx`) that open modal sign-in/sign-up and also link to the `app/(auth)/sign-in` and `app/(auth)/register` pages. Supports Google and email/password, with links to switch between sign-in and sign-up. `.env.example` documents `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

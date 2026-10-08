# Current Feature: Clerk Authentication

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

<!-- Goals and requirements -->

- Install `@clerk/nextjs`
- Add a simple `proxy.ts` file with Clerk middleware (no protected routes yet)
- Add Sign in and Register buttons to the nav bar
- Buttons open modal sign in / sign up, and also link to the `(auth)/sign-in` and `(auth)/register` pages
- Support sign in/up with Google or with credentials (email/password)
- Let users switch back and forth between the sign-in and sign-up pages

## Notes

<!-- Any extra notes -->

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are already set in `.env`
- Protected routes will be added later by the user
- Pages live in the `(auth)` route group: `(auth)/sign-in` and `(auth)/register`
- Fresh Create Next App: app files are at the repo root `app/` (no `src/`), and there is no existing auth code

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

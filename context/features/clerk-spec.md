Set up Clerk authentication.

install clerk-nextjs

add a simple proxy.ts file, ill add protected routes later.

add Sign in and register buttons to the nav bar. they should take the user to (auth)/sign-in and (auth)/register pages with modal sign in /up.

i have NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY= set in my .env file.

there should be a sign up/in with Google or with credentials. the user should be able to go back and forth between sign in and sign up pages.

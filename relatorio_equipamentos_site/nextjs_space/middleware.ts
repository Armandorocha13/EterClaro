import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - login (login page)
     * - logo.png, favicon.svg (static assets)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!api/auth|login|logo.png|favicon.svg|_next/static|_next/image).*)",
  ],
};

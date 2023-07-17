import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { redirectToSignIn } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks/user'],
  afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (auth.userId && auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/today', req.url));
    }
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

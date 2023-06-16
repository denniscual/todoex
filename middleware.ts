import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  afterAuth(auth) {
    // console.log('After auth', { auth });
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import { buildAuthProviders } from '@/auth/providers';
import { prisma } from '@/lib/prisma';

const providers = buildAuthProviders();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/sign-in',
    verifyRequest: '/sign-in/verify',
  },
  session: {
    strategy: 'database',
  },
  trustHost: true,
});

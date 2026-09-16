import type { Provider } from 'next-auth/providers';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';

export function buildAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  const googleId = process.env.AUTH_GOOGLE_ID;
  const googleSecret = process.env.AUTH_GOOGLE_SECRET;
  if (googleId && googleSecret) {
    providers.push(
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  const githubId = process.env.AUTH_GITHUB_ID;
  const githubSecret = process.env.AUTH_GITHUB_SECRET;
  if (githubId && githubSecret) {
    providers.push(
      GitHub({
        clientId: githubId,
        clientSecret: githubSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  const emailFrom = process.env.EMAIL_FROM;
  const emailServer = process.env.EMAIL_SERVER;
  if (emailFrom && emailServer) {
    providers.push(
      Nodemailer({
        server: emailServer,
        from: emailFrom,
        maxAge: 24 * 60 * 60,
      }),
    );
  }

  return providers;
}

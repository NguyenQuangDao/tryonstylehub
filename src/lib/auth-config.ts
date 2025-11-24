import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { TOKEN_CONFIG } from '../config/tokens';
import { LogLevel, logPaymentEvent, PaymentEventType } from './payment-logger';




export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        } as unknown as { id: string; email: string; name: string };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // custom fields disabled in this version
      }

      if (account?.provider === 'google') {
        // Handle Google OAuth user creation/updates
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! }
        });

        if (!existingUser) {
          // Create new user with Google account AND free tokens
          const newUser = await prisma.user.create({
            data: {
              email: token.email!,
              name: token.name!,
              password: '',
              tokenBalance: TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP, // Grant free tokens
            }
          });

          // Log free token grant
          await logPaymentEvent({
            userId: newUser.id,
            eventType: PaymentEventType.PURCHASE_COMPLETED,
            level: LogLevel.INFO,
            details: {
              source: 'signup_bonus',
              tokensAdded: TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP,
              provider: 'google',
              newBalance: TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP,
            },
          });

          token.id = newUser.id.toString();
          // custom fields disabled
        } else {
          // Update existing user
          token.id = existingUser.id.toString();
          // custom fields disabled
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
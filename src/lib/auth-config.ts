import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


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
            role: true,
            tokenBalance: true,
            avatar: true,
            shopId: true,
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
          role: user.role,
          tokenBalance: user.tokenBalance,
          avatar: user.avatar,
          shopId: user.shopId,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.tokenBalance = user.tokenBalance;
        token.shopId = user.shopId;
      }
      
      if (account?.provider === 'google') {
        // Handle Google OAuth user creation/updates
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! }
        });

        if (!existingUser) {
          // Create new user with Google account
          const newUser = await prisma.user.create({
            data: {
              email: token.email!,
              name: token.name!,
              password: '', // No password for Google users
              role: 'SHOPPER',
              tokenBalance: 10, // Free tokens for new users
            }
          });
          
          token.id = newUser.id.toString();
          token.role = newUser.role;
          token.tokenBalance = newUser.tokenBalance;
        } else {
          // Update existing user
          token.id = existingUser.id.toString();
          token.role = existingUser.role;
          token.tokenBalance = existingUser.tokenBalance;
          token.shopId = existingUser.shopId;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tokenBalance = token.tokenBalance as number;
        session.user.shopId = token.shopId as number | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
};
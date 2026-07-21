import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import type { AuthOptions } from "next-auth";
import type { UserRole } from "./auth";

const prisma = new PrismaClient();

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = (credentials ?? {}) as Credentials;
        if (!email || !password) return null;

        const dbUser = await prisma.user.findUnique({ where: { email } });

        if (!dbUser) {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            const hashed = await hash("admin123", 10);
            const newUser = await prisma.user.create({
              data: {
                email: "admin@example.com",
                username: "admin",
                passwordHash: hashed,
                role: "ADMIN",
              },
            });
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.username,
              role: newUser.role as UserRole,
            };
          }
          return null;
        }

        const valid = await compare(password, dbUser.passwordHash);
        if (!valid) return null;

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.username,
          role: dbUser.role as UserRole,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

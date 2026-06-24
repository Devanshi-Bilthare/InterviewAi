import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() }).select(
          "+password"
        );

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      } catch (error) {
        console.error("Auth authorize error:", error);
        return null;
      }
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await connectDB();
        const existingUser = await User.findOne({
          email: user.email.toLowerCase(),
        });

        if (!existingUser) {
          await User.create({
            name: user.name ?? user.email.split("@")[0],
            email: user.email.toLowerCase(),
            password: await bcrypt.hash(crypto.randomUUID(), 12),
            profilePicture: user.image,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      if (account?.provider === "google" && token.email) {
        await connectDB();
        const dbUser = await User.findOne({
          email: (token.email as string).toLowerCase(),
        });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.name = dbUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});

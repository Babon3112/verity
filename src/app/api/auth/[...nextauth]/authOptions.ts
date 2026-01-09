import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) {
          throw new Error("Missing credentials");
        }

        await dbConnect();

        const user = await userModel
          .findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          })
          .select("+password");

        if (!user) {
          throw new Error("No user found");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your account");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        user.password = undefined as any;
        return user;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.fullName = user.fullName;
        token.avatar = user.avatar;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.username = token.username as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.fullName = token.fullName as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET_KEY,
};

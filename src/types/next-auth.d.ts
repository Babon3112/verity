import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      fullName: string;
      isVerified: boolean;
      avatar:string;
    };
  }

  interface User {
    _id: string;
    username: string;
    fullName: string;
    isVerified: boolean;
    avatar:string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    fullName: string;
    isVerified: boolean;
    avatar:string;
  }
}

import NextAuth from "next-auth";
import { User as CustomUser } from "@/app/lib/auth"; // Adjust the import path

declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }

  interface User extends CustomUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: string;
    roll: string;
  }
}

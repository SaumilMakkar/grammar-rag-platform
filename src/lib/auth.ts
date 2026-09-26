import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongoClient";
import { addStyleRule } from "./vectorStore";
import { DEFAULT_STYLE_RULES } from "./defaultRules";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string
    })
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    }
  },
  events: {
    // Fires exactly once, the moment the adapter creates a brand-new user —
    // gives every new account a starter set of rules instead of an empty list.
    // Not awaited: embedding the seed rules can take 60s+ on a cold model
    // load, and that must never block or fail the sign-in response itself.
    async createUser({ user }) {
      Promise.all(DEFAULT_STYLE_RULES.map((text) => addStyleRule(text, user.id))).catch((err) => {
        console.error("Failed to seed default rules for new user", user.id, err);
      });
    }
  }
};
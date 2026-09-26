import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
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
    async createUser({ user }) {
      await Promise.all(
        DEFAULT_STYLE_RULES.map((text) => addStyleRule(text, user.id))
      );
    }
  }
};
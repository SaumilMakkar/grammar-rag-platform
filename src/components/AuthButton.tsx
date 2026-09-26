"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <button className="correct-btn" onClick={() => signIn("github")}>
        Sign in with GitHub
      </button>
    );
  }

  return (
    <div className="auth-status">
      <span>{session.user?.name}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
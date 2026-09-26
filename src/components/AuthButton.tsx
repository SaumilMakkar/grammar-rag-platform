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

  const initial = session.user?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="auth-status">
      <span className="auth-avatar">{initial}</span>
      <span className="auth-name">{session.user?.name}</span>
      <button className="auth-signout" onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
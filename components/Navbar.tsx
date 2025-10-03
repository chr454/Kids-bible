// components/Navbar.tsx
"use client";

import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function Navbar() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    })();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #eee", marginBottom: 12 }}>
      <Link href="/">Home</Link>
      <span style={{ margin: "0 12px" }}>|</span>
      <Link href="/auth/lessons">Lessons</Link>
      <span style={{ margin: "0 12px" }}>|</span>
      <Link href="/auth/quiz">Quizzes</Link>
      <span style={{ float: "right" }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>{user.email}</span>
            <button onClick={signOut}>Sign out</button>
          </>
        ) : (
          <Link href="/auth">Sign in / Sign up</Link>
        )}
      </span>
    </nav>
  );
}

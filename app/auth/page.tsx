// app/auth/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        // Use email verification flow; redirect back to a simple callback page after verify
        const { data, error } = await supabase.auth.signUp(
          { email, password },
          {
            // on verification, user will be asked to visit /auth/callback (optional)
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        );
        if (error) throw error;
        // If we have a user session immediately, create a profile row
        // (often for magic links this won't be immediate; it's still safe to attempt)
        if (data?.user?.id) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: null,
            role: "student",
          });
        }
        setMessage(
          "Sign-up successful. Check your email to verify your account, then sign in."
        );
      } else {
        // Sign in with email/password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // On success, redirect to landing which decides student/admin
        router.push("/landing");
      }
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Welcome — Sign in or Sign up</h1>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setMode("signin")}
          style={{
            marginRight: 8,
            padding: "6px 12px",
            background: mode === "signin" ? "#2563eb" : "#e5e7eb",
            color: mode === "signin" ? "#fff" : "#111",
            borderRadius: 6,
          }}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          style={{
            padding: "6px 12px",
            background: mode === "signup" ? "#2563eb" : "#e5e7eb",
            color: mode === "signup" ? "#fff" : "#111",
            borderRadius: 6,
          }}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            background: "#059669",
            color: "#fff",
            borderRadius: 8,
            border: "none",
          }}
        >
          {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: 12, color: "#b91c1c" }}>{message}</div>
      )}

      <p style={{ marginTop: 18, color: "#6b7280" }}>
        After sign-up you will receive a verification email. Finish verification,
        then sign in.
      </p>
    </div>
  );
}

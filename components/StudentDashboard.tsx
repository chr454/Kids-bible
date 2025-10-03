// components/StudentDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function StudentDashboard({ user }: { user: any }) {
  const supabase = createClientComponentClient();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [lessonsCount, setLessonsCount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: subs } = await supabase
        .from("submissions")
        .select("id, lesson_id, score, passed, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setSubmissions(subs ?? []);

      const { data: lessons } = await supabase.from("lessons").select("id").limit(1);
      setLessonsCount(lessons ? lessons.length : 0);
    }
    load();
  }, [supabase, user]);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 12 }}>
      <h1 style={{ marginBottom: 8 }}>Hi, {user.email}</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Link href="/auth/lessons">Lessons</Link>
        <Link href="/auth/quiz">Quizzes</Link>
        <Link href="/auth/comments">Comments</Link>
      </div>

      <section style={{ marginBottom: 18 }}>
        <h2>Progress</h2>
        <p>Total quizzes taken: {submissions.length}</p>
        <p>Total lessons available: {lessonsCount ?? "—"}</p>
      </section>

      <section>
        <h2>Recent quiz attempts</h2>
        {submissions.length === 0 ? (
          <p>You haven't taken any quizzes yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Score</th>
                <th>Passed</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.lesson_id}</td>
                  <td>{s.score ?? "—"}</td>
                  <td>{s.passed ? "Yes" : "No"}</td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

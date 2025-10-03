// components/AdminDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function AdminDashboard({ user }: { user: any }) {
  const supabase = createClientComponentClient();
  const [studentStats, setStudentStats] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      // Get aggregated submissions per user per lesson (latest)
      // We'll pull submissions joined with profiles
      const { data, error } = await supabase
        .from("submissions")
        .select("id, user_id, lesson_id, score, passed, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      // Group by user_id for a quick summary
      const map = new Map();
      (data || []).forEach((s) => {
        const cur = map.get(s.user_id) || { user_id: s.user_id, attempts: [], totalScore: 0, count: 0 };
        cur.attempts.push(s);
        cur.totalScore += s.score || 0;
        cur.count += 1;
        map.set(s.user_id, cur);
      });

      // Convert map to list and fetch profile names
      const list = Array.from(map.values());
      // fetch profile names
      const ids = list.map((l) => l.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);

      // attach names
      const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
      setStudentStats(list.map((l) => ({ ...l, full_name: profileMap.get(l.user_id) || null })));
    }
    load();
  }, [supabase]);

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 12 }}>
      <h1>Admin Dashboard</h1>
      <div style={{ marginBottom: 12 }}>
        <Link href="/admin/upload-lesson">Upload Lesson</Link>{" "}
        <span style={{ margin: "0 8px" }}>|</span>{" "}
        <Link href="/admin/upload-quiz">Upload Quiz</Link>{" "}
        <span style={{ margin: "0 8px" }}>|</span>{" "}
        <Link href="/admin/performance">Performance</Link>
      </div>

      <section>
        <h2>Student summary</h2>
        {studentStats.length === 0 ? (
          <p>No submissions yet</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Total attempts</th>
                <th>Average score</th>
                <th>Recent attempts (lesson:score)</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map((s) => (
                <tr key={s.user_id}>
                  <td>{s.full_name ?? s.user_id}</td>
                  <td>{s.count}</td>
                  <td>{Math.round((s.totalScore || 0) / Math.max(1, s.count))}</td>
                  <td>{s.attempts.slice(0, 5).map((a) => `${a.lesson_id}:${a.score}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

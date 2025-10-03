"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../../components/Navbar";
import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ lessonsDone: 0, quizzesDone: 0 });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        // Not logged in → redirect to login
        router.push("/auth");
        return;
      }

      setUser(user);

      // Fetch quiz submissions
      const { data: subs } = await supabase
        .from("submissions_new")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      setProgress({ lessonsDone: 0, quizzesDone: subs?.length ?? 0 });
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  if (loading) {
    return <p className={styles.loading}>Loading...</p>;
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>
          👋 Welcome, {user?.email ?? "Young General"}!
        </h1>
        <p className={styles.subtitle}>Quick progress at a glance</p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.big}>{progress.lessonsDone}</div>
            <div className={styles.cardLabel}>Lessons Completed</div>
          </div>
          <div className={styles.card}>
            <div className={styles.big}>{progress.quizzesDone}</div>
            <div className={styles.cardLabel}>Quizzes Done</div>
          </div>
        </div>

        <div className={styles.links}>
          <a href="/lessons" className={styles.link}>
            📖 Lessons
          </a>
          <a href="/quizzes" className={styles.link}>
            📝 Quizzes
          </a>
          <a href="/comments" className={styles.link}>
            💬 Comments
          </a>
        </div>
      </main>
    </>
  );
}

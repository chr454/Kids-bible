// app/auth/lessons/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "../../../components/Navbar";
import styles from "./Lessons.module.css";

export default async function LessonsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return redirect("/auth");

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .order("week_number", { ascending: true });

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Error: {error.message}</p>
      </div>
    );
  }

  const now = new Date();

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>📖 Weekly Bible Lessons</h1>
        <p className={styles.subtitle}>“Your word is a lamp to my feet...”</p>

        {lessons?.map((lesson: any) => {
          const rel = lesson.release_at ? new Date(lesson.release_at) : null;
          const isReleased = rel && rel <= now;

          return (
            <div key={lesson.id} className={styles.lessonCard}>
              <h2 className={styles.lessonTitle}>
                Week {lesson.week_number}: {lesson.title}
              </h2>
              <p className={styles.paragraph}>{lesson.description ?? ""}</p>
              <p className={styles.small}>
                Release: {rel ? rel.toLocaleDateString() : "—"}
              </p>

              {!isReleased ? (
                <span className={styles.lock}>🔒 Locked</span>
              ) : (
                <div className={styles.actions}>
                  <a className={styles.open} href={`/auth/lessons/${lesson.id}`}>
                    ▶️ Open Lesson
                  </a>
                  {lesson.ppt_url && (
                    <a className={styles.open} href={lesson.ppt_url} download>
                      ⬇️ Download PowerPoint
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

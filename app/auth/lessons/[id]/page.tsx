import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import QuizClient from "../QuizClient";
import styles from "../Lessons.module.css";

export default async function LessonDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/auth");

  const lessonId = params.id;
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Lesson not found</p>
        <a href="/lessons" className={styles.open}>
          ⬅ Back to Lessons
        </a>
      </div>
    );
  }

  // 🔒 Enforce release date lock
  const now = new Date();
  const releaseDate = lesson.release_at ? new Date(lesson.release_at) : null;
  if (!releaseDate || releaseDate > now) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <h1 className={styles.title}>🔒 Lesson Locked</h1>
          <p className={styles.paragraph}>
            This lesson will be available on{" "}
            {releaseDate?.toLocaleDateString() ?? "a future date"}.
          </p>
          <a href="/lessons" className={styles.open}>
            ⬅ Back to Lessons
          </a>
        </div>
      </>
    );
  }

  const { data: questions } = await supabase
    .from("assessments")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("id", { ascending: true });

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>
          Week {lesson.week_number}: {lesson.title}
        </h1>
        <p className={styles.paragraph}>{lesson.description}</p>

        {lesson.pdf_url ? (
          <iframe
            src={lesson.pdf_url}
            style={{ width: "100%", height: 600, border: 0 }}
          />
        ) : lesson.ppt_url ? (
          <a
            href={lesson.ppt_url}
            target="_blank"
            rel="noreferrer"
            className={styles.open}
          >
            📥 Download PPTX
          </a>
        ) : (
          <p className={styles.paragraph}>No lesson material uploaded.</p>
        )}

        <h2 className={styles.subtitle}>📝 Quiz</h2>
        {questions && questions.length > 0 ? (
          <QuizClient lessonId={lessonId} questions={questions} />
        ) : (
          <p className={styles.paragraph}>No quiz available for this lesson.</p>
        )}
      </div>
    </>
  );
}

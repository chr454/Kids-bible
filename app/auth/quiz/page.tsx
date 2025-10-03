"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function QuizPage() {
  const supabase = createClientComponentClient();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lessonId, setLessonId] = useState<number | null>(null); // 🔑 track lesson
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("assessments").select("*").limit(200);
      setAssessments(data ?? []);
      if (data && data.length > 0) {
        setLessonId(data[0].lesson_id); // assume all questions belong to one lesson
      }
    }
    load();
  }, [supabase]);

  function setAnswer(qid: number, value: string) {
    setAnswers((s) => ({ ...s, [qid]: value }));
  }

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      if (!lessonId) throw new Error("Lesson not found");

      const res = await fetch("/api/grade-proxy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: user.id, lesson_id: lessonId, answers }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result?.error?.includes("already")) {
          setSubmitted(true);
          throw new Error("❌ You have already submitted this quiz.");
        }
        throw new Error(result?.error || "Grading failed");
      }

      setMessage(
        `✅ Score: ${result.score}/${result.total} — ${
          result.passed ? "Passed" : "Failed"
        }`
      );
      setSubmitted(true);
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: 20 }}>
      <h1>📝 Quizzes</h1>
      <p>Test your knowledge from previous lessons!</p>

      {assessments.length === 0 ? (
        <p>No quizzes available yet.</p>
      ) : (
        <>
          <ol>
            {assessments.map((q) => (
              <li key={q.id} style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 4 }}>{q.question_text}</div>
                {q.options &&
                  Object.entries(q.options).map(([k, v]: any) => (
                    <label key={k} style={{ display: "block" }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        // FIXED: Store the key (A, B, C) instead of the value (sandra, David)
                        onChange={() => setAnswer(q.id, k)}
                        checked={answers[q.id] === k}
                        disabled={submitted}
                      />{" "}
                      {k}. {v}
                    </label>
                  ))}
              </li>
            ))}
          </ol>

          <button onClick={submit} disabled={loading || submitted}>
            {submitted ? "Already Submitted" : loading ? "Submitting..." : "Submit Quiz"}
          </button>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </>
      )}
    </div>
  );
}
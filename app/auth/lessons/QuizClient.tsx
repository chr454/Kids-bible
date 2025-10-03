"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function QuizClient({ lessonId, questions }: { lessonId: string, questions: any[] }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  function pick(qid: string, value: any) {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  }

  async function submit() {
    if (!confirm("Submit your answers?")) return;
    setSubmitting(true);

    // Use Supabase Edge Function you deployed
    const { data, error } = await supabase.functions.invoke("grade-submission", {
      body: { user_id: (await supabase.auth.getUser()).data.user.id, lesson_id: lessonId, answers }
    });

    setSubmitting(false);
    if (error) {
      alert("Failed: " + error.message);
    } else {
      setResult(data);
    }
  }

  if (result) {
    return (
      <div>
        <h3>Your score: {result.score} / {questions.length}</h3>
        <pre>{JSON.stringify(result.feedback, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Practice Assessment</h3>
      {questions.map((q:any, idx:number) => (
        <div key={q.id}>
          <div>{idx+1}. {q.question_text}</div>
          {(Array.isArray(q.options) ? q.options : []).map((opt:any) => (
            <label key={opt} style={{ display:"block", marginLeft: 12 }}>
              <input type="radio" name={q.id} onChange={() => pick(q.id, opt)} /> {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={submit} disabled={submitting}>Submit</button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

export default function UploadQuizPage() {
  const [lessonId, setLessonId] = useState<number | "">("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [questions, setQuestions] = useState(
    Array(20).fill({
      question_text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correct_answer: "",
    })
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch lessons for dropdown
  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, week_number")
        .order("week_number");

      if (error) {
        console.error("Error fetching lessons:", error.message);
      } else if (data) {
        setLessons(data);
      }
    };
    fetchLessons();
  }, []);

  const handleChange = (rowIndex: number, field: string, value: string) => {
    const updated = [...questions];
    updated[rowIndex] = { ...updated[rowIndex], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!lessonId || typeof lessonId !== "number") {
      setMessage("Please select a Lesson.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Transform into rows for DB
    const rows = questions
      .filter((q) => q.question_text.trim() !== "")
      .map((q) => ({
        lesson_id: lessonId,
        question_text: q.question_text,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        correct_answer: q.correct_answer,
      }));

    if (rows.length === 0) {
      setMessage("❌ Please enter at least one question.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("assessments").insert(rows);

    setLoading(false);

    if (error) {
      console.error("Insert error:", JSON.stringify(error, null, 2));
      setMessage("❌ Error uploading quiz: " + error.message);
    } else {
      setMessage("✅ Quiz uploaded successfully!");
      setQuestions(
        Array(20).fill({
          question_text: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correct_answer: "",
        })
      );
    }
  };

  return (
    <div className="p-6">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Upload Quiz (Admin)</h1>

      <div className="mb-4">
        <label className="block mb-2">Select Lesson:</label>
        <select
          value={lessonId}
          onChange={(e) =>
            setLessonId(e.target.value ? Number(e.target.value) : "")
          }
          className="border p-2 w-full"
        >
          <option value="">-- Choose a Lesson --</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              Week {lesson.week_number}: {lesson.title}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border mb-4">
        <thead>
          <tr>
            <th>Question</th>
            <th>Option A</th>
            <th>Option B</th>
            <th>Option C</th>
            <th>Option D</th>
            <th>Correct Answer</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={idx}>
              <td>
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) =>
                    handleChange(idx, "question_text", e.target.value)
                  }
                  className="border p-1 w-full"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.optionA}
                  onChange={(e) => handleChange(idx, "optionA", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.optionB}
                  onChange={(e) => handleChange(idx, "optionB", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.optionC}
                  onChange={(e) => handleChange(idx, "optionC", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.optionD}
                  onChange={(e) => handleChange(idx, "optionD", e.target.value)}
                  className="border p-1 w-full"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.correct_answer}
                  onChange={(e) =>
                    handleChange(idx, "correct_answer", e.target.value)
                  }
                  className="border p-1 w-full"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Submit Quiz"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

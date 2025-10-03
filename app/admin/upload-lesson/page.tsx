"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminUploadLesson() {
  const supabase = createClientComponentClient();
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [releaseAt, setReleaseAt] = useState(""); // 👈 new state
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      // Upload file to Supabase Storage
      const filePath = `${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("lessons-slides")
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data } = supabase.storage
        .from("lessons-slides")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Insert lesson details into lessons table
      const { error: insertError } = await supabase.from("lessons").insert({
        week_number: weekNumber,
        title,
        description,
        ppt_url: publicUrl,
        release_at: releaseAt ? new Date(releaseAt).toISOString() : null, // 👈 insert release_at
      });

      if (insertError) throw insertError;

      alert("Lesson uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setWeekNumber(1);
      setReleaseAt("");
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} style={styles.form}>
      <h2 style={styles.heading}>Upload Lesson</h2>

      <div style={styles.field}>
        <label style={styles.label}>Week Number</label>
        <input
          type="number"
          value={weekNumber}
          onChange={(e) => setWeekNumber(parseInt(e.target.value))}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Lesson Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Release At</label>
        <input
          type="datetime-local"
          value={releaseAt}
          onChange={(e) => setReleaseAt(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Upload PowerPoint (.ppt, .pptx)</label>
        <input
          type="file"
          accept=".ppt,.pptx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          style={styles.input}
        />
      </div>

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Uploading..." : "Upload Lesson"}
      </button>
    </form>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontWeight: "500",
    fontSize: "14px",
    color: "#444",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    minHeight: "80px",
  },
  button: {
    backgroundColor: "#0070f3",
    color: "#fff",
    padding: "12px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

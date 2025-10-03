// app/comments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../../components/Navbar";
import styles from "./CommentsPage.module.css";

export default function CommentsPage() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    async function init() {
      const { data: s } = await supabase.auth.getSession();
      setSession(s.session);
      const { data } = await supabase.from('comments').select('id, content, created_at, user_id').order('created_at', { ascending: false }).limit(200);
      setComments(data ?? []);
    }
    init();
  }, [supabase]);

  async function postComment() {
    if (!content.trim()) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert('Please sign in');

    await supabase.from('comments').insert([{ user_id: user.id, content }]);
    setContent('');
    // reload comments simply (or use realtime later)
    const { data } = await supabase.from('comments').select('id, content, created_at, user_id').order('created_at', { ascending: false }).limit(200);
    setComments(data ?? []);
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Comments</h1>
        {session ? (
          <div style={{marginBottom:12}}>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={3} style={{width:'100%'}} />
            <button onClick={postComment}>Post comment</button>
          </div>
        ) : (
          <p>Please sign in to post comments.</p>
        )}

        <ul className={styles.commentList}>
          {comments.map(c => (
            <li key={c.id} className={styles.comment}>
              <p className={styles.commentText}>{c.content}</p>
              <small>{new Date(c.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
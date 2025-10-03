import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { user_id, lesson_id, answers } = await req.json();

    if (!user_id || !lesson_id || !answers) {
      return new Response(
        JSON.stringify({ error: "Missing user_id, lesson_id, or answers" }),
        { status: 400 }
      );
    }

    // 🔒 Prevent multiple submissions
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "You have already taken this quiz." }),
        { status: 400 }
      );
    }

    // 📥 Fetch correct answers
    const ids = Object.keys(answers).map((id) => Number(id));
    const { data: questions, error: qError } = await supabase
      .from("assessments")
      .select("id, correct_answer")
      .in("id", ids);

    if (qError || !questions) {
      return new Response(
        JSON.stringify({ error: "Failed to load questions" }),
        { status: 500 }
      );
    }

    // ✅ Grade answers
    let score = 0;
    for (const q of questions) {
      const submitted = String(answers[String(q.id)] ?? "").trim();
      let correct = String(q.correct_answer ?? "").trim();
      
      // Remove quotes from correct answer if they exist
      // Handle both "A" and A formats
      if (correct.startsWith('"') && correct.endsWith('"')) {
        correct = correct.slice(1, -1);
      }
      
      console.log(`Question ${q.id}: submitted="${submitted}", correct="${correct}", raw_correct="${q.correct_answer}"`);
      
      if (submitted === correct) {
        score++;
        console.log(`✓ Question ${q.id} correct`);
      } else {
        console.log(`✗ Question ${q.id} incorrect`);
      }
    }

    const total = questions.length;
    const passed = score >= Math.ceil(total * 0.5);

    console.log(`Final score: ${score}/${total}, passed: ${passed}`);

    // 💾 Save submission
    const { error: insertErr } = await supabase.from("submissions").insert({
      user_id,
      lesson_id,
      answers, // store all answers jsonb
      score,
      passed,
    });

    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({ score, total, passed }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("grade-submission error", err);
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500 }
    );
  }
});
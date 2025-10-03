// app/api/grade-proxy/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/functions/v1/grade-submission`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // server env
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Invalid JSON from edge function", raw: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("grade-proxy error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// app/landing/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import StudentDashboard from "@/components/StudentDashboard";

export default async function LandingPage() {
  // ✅ Await cookies()
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // ✅ Use getUser instead of getSession
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth");
  }

  // Fetch the user’s profile and role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";

  // Render the right dashboard
  if (role === "admin") {
    return <AdminDashboard user={user} />;
  } else {
    return <StudentDashboard user={user} />;
  }
}

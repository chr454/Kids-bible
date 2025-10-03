// app/auth/callback/page.tsx
export default function AuthCallbackPage() {
  return (
    <div style={{ maxWidth: 640, margin: 40 }}>
      <h2>Email verification received</h2>
      <p>
        Thank you — your email was verified. Please go back to the sign-in page
        and sign in with your account.
      </p>
      <a href="/auth">Go to Sign-in</a>
    </div>
  );
}

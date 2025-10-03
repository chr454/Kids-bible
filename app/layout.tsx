import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YGCA — Kids Bible Study",
  description: "Young Generals Children Academy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className="antialiased bg-[#fdf6ec] text-[#2d2d2d] min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}

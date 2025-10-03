import Link from "next/link";
import Navbar from "../components/Navbar";
import styles from "./Home.module.css";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Welcome to YGCA — Kids Bible Study</h1>
        <p className={styles.subtitle}>
          Sign in or sign up to access weekly lessons, practice quizzes and track progress.
        </p>
        <div className={styles.links}>
          <Link href="/auth" className={styles.link}>Sign In / Sign Up</Link>
        </div>
      </main>
    </>
  );
}

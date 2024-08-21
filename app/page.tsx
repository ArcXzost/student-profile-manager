"use client";
import Image from "next/image";
import styles from "./main.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.container}>
      <Image src="/logo.png" alt="Logo" width={200} height={200} className={styles.logo} />
      <div className={styles.buttonContainer}>
        <Link href="/student">
          <button>STUDENT</button>
        </Link>
        <Link href="/dashboard">
          <button>ADMIN</button>
        </Link>
      </div>
    </main>
  );
}

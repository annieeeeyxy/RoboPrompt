"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Login submitted", { email, password });
    // Add authentication logic here
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fb",
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "2rem",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
  },
  title: {
    marginBottom: "1.25rem",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
  },
  form: {
    display: "grid",
    gap: "1rem",
  },
  label: {
    fontSize: "0.95rem",
    color: "#374151",
    marginBottom: "0.35rem",
  },
  input: {
    width: "100%",
    padding: "0.95rem 1rem",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    fontSize: "1rem",
    color: "#111827",
  },
  button: {
    padding: "0.95rem 1rem",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};

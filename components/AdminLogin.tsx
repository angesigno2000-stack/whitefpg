"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Accesso non riuscito.");
        return;
      }
      router.refresh();
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <h1 className="text-sm tracking-wider2 text-ash mb-8 text-center">
          WHITE F.P.G — ADMIN
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full bg-transparent border-b border-hairline focus:border-bone text-bone placeholder:text-ash py-2 outline-none transition-colors"
        />
        {error && <p className="mt-3 text-xs text-rust">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full border border-hairline hover:border-bone transition-colors py-3 text-xs tracking-wider2 text-bone disabled:opacity-40"
        >
          {loading ? "ACCESSO..." : "ENTRA"}
        </button>
      </form>
    </div>
  );
}

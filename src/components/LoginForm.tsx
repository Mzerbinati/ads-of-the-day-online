"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function siteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function LoginForm({ nextPath = "/" }: { nextPath?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function signInWithGoogle() {
    setStatus("sending");
    setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    // Ensure navigation happens even if the SDK redirect is blocked on iOS.
    if (data.url) {
      window.location.assign(data.url);
    }
  }

  async function signInWithMagicLink(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("Controlla la tua email: ti abbiamo inviato il link di accesso.");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="btn-glass flex w-full items-center justify-center gap-2"
        disabled={status === "sending"}
      >
        Continua con Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/40" />
        <span className="text-[12px] tracking-wide text-tertiary uppercase">
          oppure
        </span>
        <div className="h-px flex-1 bg-white/40" />
      </div>

      <form onSubmit={signInWithMagicLink} className="space-y-3">
        <label className="block text-[13px] font-medium text-secondary">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="mt-2 w-full rounded-[14px] border border-white/50 bg-white/45 px-4 py-3 text-[15px] text-text outline-none backdrop-blur-md placeholder:text-tertiary focus:border-accent/40"
          />
        </label>
        <button
          type="submit"
          className="btn-glass w-full"
          disabled={status === "sending"}
        >
          Invia magic link
        </button>
      </form>

      {message && (
        <p
          className={`text-center text-[14px] ${
            status === "error" ? "text-red-600" : "text-secondary"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

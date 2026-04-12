"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { appUrl, resolveAuthRedirect } from "@/lib/appOrigin";

const spinner = (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
);

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && mounted) {
          window.location.href = resolveAuthRedirect("/chat");
        }
      } catch {
        /* not signed in */
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const origin = window.location.origin;
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/chat")}`;
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo },
      });
      if (signUpError) {
        setError(signUpError.message);
        setIsSubmitting(false);
        return;
      }
      if (data.session) {
        window.location.href = resolveAuthRedirect("/chat");
        return;
      }
      setAwaitingEmail(true);
      setIsSubmitting(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
        <div className="text-paragraph mb-4">Loading...</div>
        {spinner}
      </div>
    );
  }

  if (awaitingEmail) {
    return (
      <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
        <div className="glass-surface bg-surface-container-high/90 rounded-md p-8 max-w-md w-full ghost-border ambient-float text-center">
          <h1 className="text-2xl font-heading font-bold text-header mb-4">
            Check your email
          </h1>
          <p className="text-paragraph mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Open it to
            finish signing up.
          </p>
          <a
            href={appUrl("/chat/sign-in")}
            className="text-primary-dim hover:text-primary underline-offset-4 hover:underline text-sm"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
      <div className="glass-surface bg-surface-container-high/90 rounded-md p-8 max-w-md w-full ghost-border ambient-float">
        <h1 className="text-2xl font-heading font-bold text-header mb-6 text-center">
          Sign Up
        </h1>
        <p className="text-paragraph mb-6 text-center">
          Create an account to access the chat interface
        </p>
        <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
          <div>
            <label htmlFor="sign-up-email" className="sr-only">
              Email
            </label>
            <input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="sign-up-password" className="sr-only">
              Password
            </label>
            <input
              id="sign-up-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-medium py-3 px-4 rounded-md transition duration-200 primary-glow hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="text-muted-foreground text-center mt-6 text-sm">
          Already have an account?{" "}
          <a
            href={appUrl("/chat/sign-in")}
            className="text-primary-dim hover:text-primary underline-offset-4 hover:underline"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}

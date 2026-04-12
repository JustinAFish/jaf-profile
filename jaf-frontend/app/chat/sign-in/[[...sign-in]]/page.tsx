"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { appUrl, resolveAuthRedirect } from "@/lib/appOrigin";

const debugAuth = process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

const spinner = (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
);

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  useEffect(() => {
    let mounted = true;

    const checkAuthAndRedirect = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!mounted) return;

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          if (debugAuth) {
            console.log("Sign-in page: User already authenticated:", user.email);
          }
          const destination = redirectUrl || "/chat";
          const referrer = document.referrer;
          if (
            referrer.includes("/chat") ||
            referrer.includes("/auth/callback")
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          if (!mounted) return;
          window.location.href = resolveAuthRedirect(destination);
          return;
        }
      } catch (e) {
        if (debugAuth) {
          console.log("Sign-in page: Session check failed", e);
        }
      }

      if (mounted) setIsLoading(false);
    };

    void checkAuthAndRedirect();
    return () => {
      mounted = false;
    };
  }, [redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        setError(signError.message);
        setIsSubmitting(false);
        return;
      }
      const destination = redirectUrl || "/chat";
      window.location.href = resolveAuthRedirect(destination);
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

  return (
    <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
      <div className="glass-surface bg-surface-container-high/90 rounded-md p-8 max-w-md w-full ghost-border ambient-float">
        <h1 className="text-2xl font-heading font-bold text-header mb-6 text-center">
          Sign In
        </h1>
        <p className="text-paragraph mb-6 text-center">
          Sign in to access the chat interface
        </p>
        <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
          <div>
            <label htmlFor="sign-in-email" className="sr-only">
              Email
            </label>
            <input
              id="sign-in-email"
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
            <label htmlFor="sign-in-password" className="sr-only">
              Password
            </label>
            <input
              id="sign-in-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Password"
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
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-muted-foreground text-center mt-6 text-sm">
          No account?{" "}
          <a
            href={appUrl("/chat/sign-up")}
            className="text-primary-dim hover:text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
          <div className="text-paragraph mb-4">Loading...</div>
          {spinner}
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

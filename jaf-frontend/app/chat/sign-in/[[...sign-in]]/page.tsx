"use client";
import { useEffect, useState, Suspense } from "react";
import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";
import { useSearchParams } from "next/navigation";
import { appUrl, resolveAuthRedirect } from "@/lib/appOrigin";

const debugAuth = process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

const spinner = (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
);

function SignInContent() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  useEffect(() => {
    let mounted = true;

    const checkAuthAndRedirect = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!mounted) return;

      try {
        const user = await getCurrentUser();
        if (debugAuth) {
          console.log("Sign-in page: User already authenticated:", user.username);
        }

        const destination = redirectUrl || "/chat";

        const referrer = document.referrer;
        if (
          referrer.includes("/chat") ||
          referrer.includes("/chat/callback")
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (!mounted) return;

        window.location.href = resolveAuthRedirect(destination);
        return;
      } catch {
        if (debugAuth) {
          console.log("Sign-in page: User not authenticated, showing sign in");
        }
      }

      if (!mounted) return;

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("code")) {
        window.location.href = `${appUrl("/chat/callback")}${window.location.search}`;
        return;
      }

      if (mounted) {
        setIsLoading(false);
      }
    };

    void checkAuthAndRedirect();

    return () => {
      mounted = false;
    };
  }, [redirectUrl]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithRedirect();
    } catch {
      console.error("Error signing in");
      setIsLoading(false);
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
        <button
          type="button"
          onClick={() => void handleSignIn()}
          className="w-full bg-primary text-on-primary font-medium py-3 px-4 rounded-md transition duration-200 primary-glow hover:bg-primary/90"
        >
          Sign In with AWS Cognito
        </button>
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

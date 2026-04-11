"use client";
import { useEffect, useState } from "react";
import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";
import { appUrl } from "@/lib/appOrigin";

const spinner = (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
);

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        await getCurrentUser();
        window.location.href = appUrl("/chat");
        return;
      } catch {
        /* not signed in */
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("code")) {
        setIsLoading(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await getCurrentUser();
          window.location.href = appUrl("/chat");
          return;
        } catch {
          console.error("Error processing OAuth callback");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    void checkAuthAndRedirect();
  }, []);

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithRedirect();
    } catch {
      console.error("Error signing up");
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
          Sign Up
        </h1>
        <p className="text-paragraph mb-6 text-center">
          Create an account to access the chat interface
        </p>
        <button
          type="button"
          onClick={() => void handleSignUp()}
          className="w-full bg-primary text-on-primary font-medium py-3 px-4 rounded-md transition duration-200 primary-glow hover:bg-primary/90"
        >
          Sign Up with AWS Cognito
        </button>
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

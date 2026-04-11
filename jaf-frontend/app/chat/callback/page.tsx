"use client";
import { useEffect, useState, Suspense } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useSearchParams } from "next/navigation";
import { Hub } from "aws-amplify/utils";
import { appUrl, resolveAuthRedirect } from "@/lib/appOrigin";

const spinner = (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
);

function AuthCallbackContent() {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;
    let hubUnsubscribe: (() => void) | null = null;

    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const state = searchParams.get("state");

        if (error) {
          console.error("OAuth error:", error, errorDescription);
          if (mounted) setStatus("error");
          return;
        }

        if (!code) {
          try {
            await getCurrentUser();
            if (mounted) {
              setStatus("success");
              setTimeout(() => {
                if (mounted) {
                  window.location.href = resolveAuthRedirect("/chat");
                }
              }, 1000);
            }
            return;
          } catch {
            window.location.href = appUrl("/chat/sign-in");
            return;
          }
        }

        let redirectUrl = "/chat";
        try {
          if (state) {
            const decodedState = JSON.parse(atob(state));
            redirectUrl = decodedState.redirect_url || "/chat";
          }
        } catch {
          /* use default */
        }

        hubUnsubscribe = Hub.listen("auth", ({ payload }) => {
          if (!mounted) return;

          switch (payload.event) {
            case "signInWithRedirect_failure":
              setStatus("error");
              break;
            case "signedIn":
              setStatus("success");
              setTimeout(() => {
                if (mounted) {
                  window.location.href = resolveAuthRedirect(redirectUrl);
                }
              }, 1000);
              break;
            case "tokenRefresh_failure":
              setStatus("error");
              break;
            default:
              break;
          }
        });

        try {
          await getCurrentUser();
          if (mounted) {
            setStatus("success");
            setTimeout(() => {
              if (mounted) {
                window.location.href = resolveAuthRedirect(redirectUrl);
              }
            }, 1000);
          }
          return;
        } catch {
          /* waiting for OAuth */
        }
      } catch (err) {
        console.error("Error in auth callback:", err);
        if (mounted) setStatus("error");
      }
    };

    void handleCallback();

    return () => {
      mounted = false;
      if (hubUnsubscribe) {
        hubUnsubscribe();
      }
    };
  }, [searchParams]);

  if (status === "processing") {
    return (
      <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
        <div className="text-paragraph mb-4">Processing authentication...</div>
        {spinner}
        <p className="text-muted-foreground text-sm mt-4">
          Exchanging authorization code for tokens...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
        <div className="text-tertiary mb-4 font-medium">
          Authentication successful
        </div>
        <div className="text-paragraph">Redirecting to chat...</div>
      </div>
    );
  }

  return (
    <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
      <div className="glass-surface bg-surface-container-high/90 rounded-md p-8 max-w-md w-full text-center ghost-border ambient-float">
        <div className="text-destructive mb-4 font-heading font-semibold">
          Authentication failed
        </div>
        <p className="text-paragraph mb-6">
          There was an error processing your authentication. Please check the
          browser console for details.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = appUrl("/chat/sign-in");
          }}
          className="bg-primary text-on-primary font-medium py-2 px-4 rounded-md transition duration-200 primary-glow hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
          <div className="text-paragraph mb-4">Loading...</div>
          {spinner}
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

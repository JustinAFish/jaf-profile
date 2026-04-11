"use client";

import React, { useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify, type ResourcesConfig } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { getAppOrigin } from "@/lib/appOrigin";

const debugAuth = process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

function buildAmplifyConfig(): ResourcesConfig {
  const origin = getAppOrigin();
  return {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID || "",
        userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID || "",
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN || "",
            scopes: ["email", "openid", "profile"],
            redirectSignIn: [`${origin}/chat/callback`],
            redirectSignOut: [`${origin}/`],
            responseType: "code" as const,
          },
        },
      },
    },
  };
}

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    Amplify.configure(buildAmplifyConfig());

    const hubUnsubscribe = Hub.listen("auth", ({ payload }) => {
      if (!debugAuth) return;
      switch (payload.event) {
        case "signInWithRedirect_failure":
          console.error("Sign in with redirect failed");
          break;
        case "tokenRefresh_failure":
          console.error("Token refresh failed");
          break;
        default:
          break;
      }
    });

    const processOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        console.error(
          "[AmplifyProvider] OAuth error in URL:",
          error,
          urlParams.get("error_description"),
        );
        return;
      }

      if (code && window.location.pathname === "/chat/callback") {
        try {
          const { fetchAuthSession } = await import("aws-amplify/auth");
          await fetchAuthSession({ forceRefresh: true });
        } catch (err) {
          console.error("[AmplifyProvider] Error processing OAuth callback:", err);
        }
      }
    };

    const t = setTimeout(() => {
      void processOAuthCallback();
    }, 100);

    return () => {
      clearTimeout(t);
      hubUnsubscribe();
    };
  }, []);

  return <>{children}</>;
}

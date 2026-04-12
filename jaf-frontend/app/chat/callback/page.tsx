"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const spinner = (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
);

function LegacyCallbackRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    window.location.replace(`/auth/callback${q ? `?${q}` : ""}`);
  }, [searchParams]);

  return (
    <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
      <div className="text-paragraph mb-4">Redirecting…</div>
      {spinner}
    </div>
  );
}

export default function LegacyAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="mt-24 p-6 flex flex-col items-center justify-center min-h-[400px] text-foreground">
          <div className="text-paragraph mb-4">Loading...</div>
          {spinner}
        </div>
      }
    >
      <LegacyCallbackRedirect />
    </Suspense>
  );
}

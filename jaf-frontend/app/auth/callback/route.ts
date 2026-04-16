import { NextResponse } from "next/server";
import { resolveAuthCallbackOrigin } from "@/lib/authCallbackOrigin";
import { sendWelcomeEmail } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/chat";
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOrigin = resolveAuthCallbackOrigin(request);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Welcome email: runs after session is established (e.g. email confirm / magic link).
      // If the user opens the same link again, they may get duplicate emails unless you
      // dedupe (e.g. user_metadata flag with service role or a small DB table).
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const email = user?.email;
        if (email) {
          await sendWelcomeEmail({
            to: email,
            name:
              (user.user_metadata?.full_name as string | undefined) ?? null,
          });
        }
      } catch (err) {
        console.error("Welcome email failed:", err);
      }

      return NextResponse.redirect(`${publicOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${publicOrigin}/chat/sign-in`);
}

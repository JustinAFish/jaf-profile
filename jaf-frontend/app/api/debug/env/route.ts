import { NextResponse } from "next/server";

export async function GET() {
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEBUG_ENV === "true";

  if (!allowed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    EMAIL_USER_EXISTS: !!process.env.EMAIL_USER,
    EMAIL_PASSWORD_EXISTS: !!process.env.EMAIL_PASSWORD,
    ALL_SUPABASE_VARS: Object.keys(process.env).filter((key) =>
      key.includes("SUPABASE"),
    ),
    ALL_EMAIL_VARS: Object.keys(process.env).filter((key) =>
      key.includes("EMAIL"),
    ),
    RUNTIME: process.env.AWS_EXECUTION_ENV || "unknown",
    ALL_ENV_KEYS: Object.keys(process.env).length,
  };

  return NextResponse.json(envVars);
}

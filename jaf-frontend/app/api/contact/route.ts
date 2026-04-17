import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    if (
      !process.env.RESEND_API_KEY?.trim() ||
      !process.env.RESEND_FROM_EMAIL?.trim()
    ) {
      console.error(
        "Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variables",
      );
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 },
      );
    }

    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, or message" },
        { status: 400 },
      );
    }

    const toAddress =
      process.env.CONTACT_TO_EMAIL || "JustinAnthonyFish@gmail.com";

    await sendContactFormEmail({
      submitterName: String(name),
      submitterEmail: String(email),
      message: String(message),
      to: toAddress,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending email:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

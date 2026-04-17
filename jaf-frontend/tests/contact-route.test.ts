import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const emailsSend = vi
  .fn()
  .mockResolvedValue({ data: { id: "test-email-id" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: emailsSend },
  })),
}));

describe("POST /api/contact", () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;
  const originalTo = process.env.CONTACT_TO_EMAIL;

  beforeEach(() => {
    vi.resetModules();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "Site <onboarding@resend.dev>";
    delete process.env.CONTACT_TO_EMAIL;
    emailsSend.mockClear();
    emailsSend.mockResolvedValue({ data: { id: "test-email-id" }, error: null });
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = originalKey;
    process.env.RESEND_FROM_EMAIL = originalFrom;
    process.env.CONTACT_TO_EMAIL = originalTo;
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", email: "a@b.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 when email env is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    const { POST } = await import("@/app/api/contact/route");
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "t@example.com",
        message: "Hi",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("sends mail and returns 200 when configured", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "user@example.com",
        message: "Hello there",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(emailsSend).toHaveBeenCalledTimes(1);
    const payload = emailsSend.mock.calls[0][0] as {
      to?: string;
      subject?: string;
    };
    expect(payload.to).toBe("JustinAnthonyFish@gmail.com");
    expect(payload.subject).toContain("Test User");
  });
});

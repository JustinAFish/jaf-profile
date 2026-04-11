import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
const createTransport = vi.fn().mockReturnValue({ sendMail });

vi.mock("nodemailer", () => ({
  default: {
    createTransport,
  },
}));

describe("POST /api/contact", () => {
  const originalUser = process.env.EMAIL_USER;
  const originalPass = process.env.EMAIL_PASSWORD;

  beforeEach(() => {
    vi.resetModules();
    process.env.EMAIL_USER = "test@example.com";
    process.env.EMAIL_PASSWORD = "secret";
    sendMail.mockClear();
    createTransport.mockClear();
    createTransport.mockReturnValue({ sendMail });
  });

  afterEach(() => {
    process.env.EMAIL_USER = originalUser;
    process.env.EMAIL_PASSWORD = originalPass;
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
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
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
    expect(createTransport).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledTimes(1);
    const payload = sendMail.mock.calls[0][0] as { to?: string; subject?: string };
    expect(payload.to).toBe("JustinAnthonyFish@gmail.com");
    expect(payload.subject).toContain("Test User");
  });
});

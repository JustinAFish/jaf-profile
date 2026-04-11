import { expect, test } from "@playwright/test";

test.describe("chat with stub backend", () => {
  test("send message shows stub assistant reply", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/chat");
    await expect(page.getByText("Speak to AI Justin").first()).toBeVisible({
      timeout: 15_000,
    });
    // Close welcome modal without "Get Started" (that opens ExampleQuestions overlay and blocks the composer).
    // Navbar is z-50 vs modal z-41, so the close control can sit under the nav; force the click.
    await page.getByRole("button", { name: "Close modal" }).click({ force: true });
    const input = page.getByTestId("chat-message-input");
    await input.fill("Hello from e2e");
    await input.press("Enter");
    await expect(page.getByText("E2E stub reply")).toBeVisible({
      timeout: 15_000,
    });
  });
});

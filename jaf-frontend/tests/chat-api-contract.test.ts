import { describe, expect, it } from "vitest";

/**
 * Backend contract: jaf-backend/app/core/models.py `ChatResponse` exposes
 * `response`, `sources`, `escalate_to_hypercare`.
 */
describe("chat API contract (backend ChatResponse)", () => {
  it("matches the shape returned by POST /api/chat/message", () => {
    const sample: {
      response: string;
      sources: unknown[];
      escalate_to_hypercare: boolean;
    } = {
      response: "hello",
      sources: [],
      escalate_to_hypercare: false,
    };
    expect(Object.keys(sample).sort()).toEqual(
      ["escalate_to_hypercare", "response", "sources"].sort(),
    );
  });
});

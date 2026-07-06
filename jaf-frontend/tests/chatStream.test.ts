/**
 * Unit tests for the SSE-over-fetch parser in lib/chatStream.ts, driven by a
 * synthetic ReadableStream so frame splitting across chunk boundaries is covered.
 */
import { describe, expect, it } from "vitest";
import { readChatStream, type FinalPayload } from "@/lib/chatStream";

/** Builds a Response whose body emits the given strings as separate chunks. */
function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(body);
}

async function collect(chunks: string[]) {
  const tokens: string[] = [];
  const finals: FinalPayload[] = [];
  const errors: string[] = [];
  let idleResets = 0;
  await readChatStream(
    streamResponse(chunks),
    {
      onToken: (d) => tokens.push(d),
      onFinal: (f) => finals.push(f),
      onError: (e) => errors.push(e),
    },
    () => idleResets++,
  );
  return { tokens, finals, errors, idleResets };
}

describe("readChatStream", () => {
  it("parses token, final, and done events", async () => {
    const { tokens, finals, errors, idleResets } = await collect([
      'event: token\ndata: "Hello "\n\n',
      'event: token\ndata: "world"\n\n',
      'event: final\ndata: {"sources":[],"escalate_to_hypercare":false}\n\n',
      "event: done\ndata: {}\n\n",
    ]);
    expect(tokens.join("")).toBe("Hello world");
    expect(finals).toEqual([{ sources: [], escalate_to_hypercare: false }]);
    expect(errors).toEqual([]);
    expect(idleResets).toBe(4);
  });

  it("handles frames split across chunk boundaries", async () => {
    const { tokens, finals } = await collect([
      'event: tok',
      'en\ndata: "Hel',
      'lo"\n\nevent: final\ndata: {"sources"',
      ':[]}\n\nevent: done\ndata: {}\n\n',
    ]);
    expect(tokens).toEqual(["Hello"]);
    expect(finals).toEqual([{ sources: [] }]);
  });

  it("dispatches error events", async () => {
    const { errors } = await collect([
      'event: error\ndata: {"detail":"boom"}\n\n',
      "event: done\ndata: {}\n\n",
    ]);
    expect(errors).toEqual(["boom"]);
  });

  it("throws when the response has no body", async () => {
    const res = new Response(null);
    Object.defineProperty(res, "body", { value: null });
    await expect(
      readChatStream(res, {
        onToken: () => {},
        onFinal: () => {},
        onError: () => {},
      }),
    ).rejects.toThrow("no body");
  });
});

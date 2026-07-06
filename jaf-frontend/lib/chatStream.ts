/**
 * Reader for the backend's POST /api/chat/stream SSE response. Parses the
 * \n\n-delimited event frames off a fetch ReadableStream (EventSource can't POST)
 * and dispatches token/final/error events to the caller's handlers.
 */

import type { Source } from "@/types/chat";

/** Payload of the stream's single `final` event. */
export interface FinalPayload {
  sources?: Source[];
  escalate_to_hypercare?: boolean;
}

export interface ChatStreamHandlers {
  onToken: (delta: string) => void;
  onFinal: (payload: FinalPayload) => void;
  onError: (detail: string) => void;
}

/**
 * Consumes the SSE body until the stream closes, invoking handlers per event.
 * Calls resetIdleTimer on every received chunk so the caller can enforce an
 * inter-chunk idle timeout via its AbortController.
 */
export async function readChatStream(
  res: Response,
  handlers: ChatStreamHandlers,
  resetIdleTimer: () => void = () => {},
): Promise<void> {
  if (!res.body) {
    throw new Error("Response has no body to stream");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    resetIdleTimer();
    buf += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, sep);
      buf = buf.slice(sep + 2);

      const event = /^event: (.+)$/m.exec(frame)?.[1] ?? "message";
      const data = /^data: (.+)$/m.exec(frame)?.[1];

      if (event === "token" && data) {
        handlers.onToken(JSON.parse(data));
      } else if (event === "final" && data) {
        handlers.onFinal(JSON.parse(data));
      } else if (event === "error") {
        handlers.onError(
          data ? (JSON.parse(data).detail ?? "stream error") : "stream error",
        );
      }
      // "done" frames carry nothing; the read loop exits when the body closes.
    }
  }
}

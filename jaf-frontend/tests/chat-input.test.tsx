import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ChatInput } from "@/components/ChatInput";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ChatInput example-questions hint", () => {
  it("shows the hint after the delay only on an empty chat (messageCount === 0)", () => {
    vi.useFakeTimers();
    render(<ChatInput onSendMessage={() => {}} messageCount={0} />);

    expect(screen.queryByText("Click for example questions")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Click for example questions")).toBeTruthy();
  });

  it("never shows the hint once the chat has messages", () => {
    vi.useFakeTimers();
    render(<ChatInput onSendMessage={() => {}} messageCount={3} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Click for example questions")).toBeNull();
  });
});

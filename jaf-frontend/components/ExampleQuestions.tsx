/**
 * ExampleQuestions — floating panel of sample prompts (no hard dividers).
 * Rendered via a portal so `position: fixed` is not affected by transforms /
 * backdrop-filter on the chat input row (which caused blur flicker on hover).
 */
import React, { useCallback, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ExampleQuestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionClick: (question: string) => void;
  /** Anchor for desktop placement (panel sits above this element). */
  anchorRef: React.RefObject<HTMLElement | null>;
}

interface QuestionCategory {
  title: string;
  questions: {
    text: string;
    isSequence?: boolean;
    sequenceNumber?: number;
  }[];
}

const MD_QUERY = "(min-width: 768px)";

export function ExampleQuestions({
  isOpen,
  onClose,
  onQuestionClick,
  anchorRef,
}: ExampleQuestionsProps) {
   const [desktopRect, setDesktopRect] = useState<{
    bottom: number;
    right: number;
    width: number;
  } | null>(null);

  const updateDesktopPlacement = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!isOpen || !anchorRef.current) {
      setDesktopRect(null);
      return;
    }
    if (!window.matchMedia(MD_QUERY).matches) {
      setDesktopRect(null);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    const margin = 8;
    setDesktopRect({
      bottom: window.innerHeight - rect.top + margin,
      right: window.innerWidth - rect.right,
      width: Math.min(384, window.innerWidth - 16),
    });
  }, [anchorRef, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setDesktopRect(null);
      return;
    }
    updateDesktopPlacement();
    window.addEventListener("resize", updateDesktopPlacement);
    window.addEventListener("scroll", updateDesktopPlacement, true);
    return () => {
      window.removeEventListener("resize", updateDesktopPlacement);
      window.removeEventListener("scroll", updateDesktopPlacement, true);
    };
  }, [isOpen, updateDesktopPlacement]);

  const questionCategories: QuestionCategory[] = [
    {
      title: "Test the chat with common queries",
      questions: [
        { text: "What makes Justin a good fit for my business?" },
        { text: "Provide examples of successful client deliveries?" },
        {
          text: "What are Justin's unique selling points that will drive value for my organisation?",
        },
      ],
    },
  ];

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const isDesktopAnchored = desktopRect != null;
  const panelClassName = isDesktopAnchored
    ? "animate-fadeIn fixed z-[81] flex max-h-[min(75vh,32rem)] flex-col"
    : `
        animate-fadeIn fixed z-[81] flex max-h-[min(68dvh,calc(100dvh-6.5rem))] flex-col
        left-3 right-3
        bottom-[max(0.75rem,calc(0.75rem+env(safe-area-inset-bottom,0px)+4.25rem))]
      `;
  const panelStyle: React.CSSProperties | undefined = isDesktopAnchored
    ? {
        bottom: desktopRect.bottom,
        right: desktopRect.right,
        width: desktopRect.width,
        left: "auto",
      }
    : undefined;

  const ui = (
    <>
      <div
        className="fixed inset-0 z-[80] bg-surface/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={panelClassName}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="example-questions-title"
      >
        <div className="card flex min-h-0 max-h-full flex-col overflow-hidden rounded-md bg-surface-container-high/95 backdrop-blur-lg ghost-border ambient-float">
          <div className="shrink-0 border-b border-border/40 px-3 py-2.5 md:px-5 md:py-4">
            <div className="rounded-md bg-surface-container-low/50 px-2.5 py-2 md:px-3 md:py-3">
              <h2
                id="example-questions-title"
                className="font-heading text-base font-semibold text-primary md:text-xl"
              >
                Example Questions
              </h2>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 md:p-5 md:pt-4">
            <div className="space-y-4 md:space-y-6">
              {questionCategories.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${categoryIndex * 100}ms` }}
                >
                  <div className="space-y-2 md:space-y-3">
                    <div className="mb-1 md:mb-3">
                      <h4 className="text-foreground text-sm font-medium leading-snug md:text-lg">
                        {category.title}
                      </h4>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      {category.questions.map((question, questionIndex) => (
                        <button
                          type="button"
                          key={questionIndex}
                          onClick={() => onQuestionClick(question.text)}
                          className={`
                            w-full rounded-md p-2.5 text-left text-xs leading-snug text-foreground transition-all duration-200
                            hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(129,236,255,0.06)] hover-lift
                            md:p-3 md:text-sm md:leading-normal
                            ${question.isSequence ? "relative pl-7 md:pl-8" : ""}
                          `}
                        >
                          {question.isSequence && (
                            <span className="absolute left-2.5 text-muted-foreground md:left-3">
                              {question.sequenceNumber}
                            </span>
                          )}
                          {question.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {categoryIndex < questionCategories.length - 1 && (
                    <div className="my-4 h-2 md:my-6 md:h-3" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(ui, document.body);
}

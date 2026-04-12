/**
 * ExampleQuestions — floating panel of sample prompts (no hard dividers).
 */
import React from "react";

interface ExampleQuestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionClick: (question: string) => void;
}

interface QuestionCategory {
  title: string;
  questions: {
    text: string;
    isSequence?: boolean;
    sequenceNumber?: number;
  }[];
}

export function ExampleQuestions({
  isOpen,
  onClose,
  onQuestionClick,
}: ExampleQuestionsProps) {
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

  return (
    <>
      <div
        className="fixed inset-0 z-[40] bg-surface/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={`
          animate-fadeIn z-[45] flex max-h-[min(68dvh,calc(100dvh-6.5rem))] flex-col
          fixed left-3 right-3
          bottom-[max(0.75rem,calc(0.75rem+env(safe-area-inset-bottom,0px)+4.25rem))]
          md:absolute md:inset-x-auto md:left-auto md:right-0 md:bottom-full md:mb-2 md:max-h-[min(75vh,32rem)]
          md:w-96 md:max-w-[min(24rem,calc(100vw-1rem))]
        `}
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
}

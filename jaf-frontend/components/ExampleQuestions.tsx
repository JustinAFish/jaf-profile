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
      <div className="fixed inset-0" onClick={onClose} aria-hidden />

      <div
        style={{ zIndex: 39 }}
        className="absolute bottom-full right-0 mb-2 w-96 animate-fadeIn"
      >
        <div className="card bg-surface-container-high/95 backdrop-blur-lg rounded-md ghost-border ambient-float">
          <div className="p-5">
            <div className="pb-4 mb-4 bg-surface-container-low/50 rounded-md px-3 py-3">
              <h2 className="text-xl font-heading font-semibold text-primary">
                Example Questions
              </h2>
            </div>

            <div className="space-y-6">
              {questionCategories.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${categoryIndex * 100}ms` }}
                >
                  <div className="space-y-3">
                    <div className="mb-3">
                      <h4 className="text-foreground font-medium text-lg">
                        {category.title}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {category.questions.map((question, questionIndex) => (
                        <button
                          type="button"
                          key={questionIndex}
                          onClick={() => onQuestionClick(question.text)}
                          className={`
                            w-full text-left p-3 rounded-md text-foreground
                            hover:bg-primary/10 hover:text-primary transition-all duration-200 text-sm
                            ${question.isSequence ? "pl-8 relative" : ""}
                            hover:shadow-[0_0_20px_rgba(129,236,255,0.06)] hover-lift
                          `}
                        >
                          {question.isSequence && (
                            <span className="absolute left-3 text-muted-foreground">
                              {question.sequenceNumber}
                            </span>
                          )}
                          {question.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {categoryIndex < questionCategories.length - 1 && (
                    <div className="my-6 h-3" aria-hidden />
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

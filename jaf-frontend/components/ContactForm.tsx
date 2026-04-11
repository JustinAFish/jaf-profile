"use client";

import { useId, useState } from "react";

const inputClass =
  "w-full p-3 rounded-md bg-surface-container-lowest text-foreground placeholder:text-muted-foreground ghost-border input-focus-glow transition-shadow duration-200";

export type ContactFormProps = {
  /** Tighter spacing for modal */
  compact?: boolean;
  /** Called after a successful submit */
  onSuccess?: () => void;
};

export function ContactForm({ compact, onSuccess }: ContactFormProps) {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const messageId = `${baseId}-message`;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          recipient: "JustinAnthonyFish@gmail.com",
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        onSuccess?.();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const gap = compact ? "space-y-4" : "space-y-6";
  const textRows = compact ? 4 : 6;

  return (
    <form className={gap} onSubmit={handleSubmit}>
      <div className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"}`}>
        <div>
          <label
            htmlFor={nameId}
            className="block text-paragraph mb-2 text-label-md uppercase tracking-wide"
          >
            Your Name / Organisation
          </label>
          <input
            type="text"
            id={nameId}
            name="name"
            className={inputClass}
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label
            htmlFor={emailId}
            className="block text-paragraph mb-2 text-label-md uppercase tracking-wide"
          >
            Your Email
          </label>
          <input
            type="email"
            id={emailId}
            name="email"
            className={inputClass}
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={messageId}
          className="block text-paragraph mb-2 text-label-md uppercase tracking-wide"
        >
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={textRows}
          className={`${inputClass} resize-none`}
          placeholder="Your message..."
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className={`px-8 py-3 rounded-md font-medium bg-primary text-on-primary primary-glow hover:bg-primary/90 transition-colors ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {submitStatus === "success" && (
        <p className="text-tertiary mt-2">
          Your message has been sent successfully!
        </p>
      )}

      {submitStatus === "error" && (
        <p className="text-destructive mt-2">
          Failed to send message. Please try again later.
        </p>
      )}
    </form>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";

export default function HomeContact() {
  return (
    <section
      id="contact"
      className="scroll-mt-[var(--site-header-height)] py-20 px-4 sm:px-8 md:px-12 lg:px-16 bg-surface-container-low"
    >
      <Card className="group relative rounded-md bg-surface-container-high/90 glass-surface border-0 shadow-none transition-all duration-300 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)]">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-md" />
        </div>
        <CardHeader>
          <h2 className="text-4xl font-heading font-bold mb-4 text-header">
            Get in Touch
          </h2>
          <p className="text-lg md:text-xl text-paragraph mb-2">
            Please don't hesitate to reach out if you require my expertise for your ambitious endeavor.
          </p>
        </CardHeader>
        <CardContent className="relative z-10 px-4 sm:px-6 md:px-8">
          <ContactForm />
        </CardContent>
      </Card>
    </section>
  );
}
